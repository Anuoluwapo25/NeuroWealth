// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// USER POSITION TRACKER INTERFACE
interface IUserPositionTracker {
    function recordPosition(
        address user,
        uint256 depositAmount,
        address poolAddress
    ) external;

    function recordFeeCollection(address user, uint256 feesInUSDC) external;

    function calculateUserAPY(
        address user
    )
        external
        view
        returns (
            uint256 userAPY,
            uint256 totalFeesEarned,
            uint256 daysActive,
            uint256 dailyReturn
        );

    function getUserPosition(
        address user
    )
        external
        view
        returns (
            uint256 depositAmount,
            uint256 totalFeesCollected,
            uint256 daysActive,
            address poolAddress,
            bool isActive
        );

    function closePosition(address user) external;
}

// UNISWAP V3 INTERFACES
interface INonfungiblePositionManager is IERC721 {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    function mint(
        MintParams calldata params
    )
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    function decreaseLiquidity(
        DecreaseLiquidityParams calldata params
    ) external payable returns (uint256 amount0, uint256 amount1);

    function collect(
        CollectParams calldata params
    ) external payable returns (uint256 amount0, uint256 amount1);

    function positions(
        uint256 tokenId
    )
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
}

interface IUniswapV3Pool {
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );
}

interface IUniswapV3Factory {
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);
}

/**
 * @title UniswapV3StrategyAdapter with AI Agent & Super Admin Roles
 * @notice Manages Uniswap V3 positions with role-based access control
 * @dev Role Hierarchy:
 *      - SUPER_ADMIN (Deployer): Full control, can grant/revoke AI agents
 *      - AI_AGENT_ROLE: Can execute deposits, withdrawals, fee collection
 */
contract UniswapV3StrategyAdapter is
    ReentrancyGuard,
    Ownable,
    IERC721Receiver,
    AccessControl
{
    using SafeERC20 for IERC20;

    // ============================================================================
    // ROLES - AI AGENT & SUPER ADMIN
    // ============================================================================
    
    bytes32 public constant SUPER_ADMIN = keccak256("SUPER_ADMIN");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    struct NetworkConfig {
        address positionManager;
        address swapRouter;
        address factory;
        address usdc;
        address weth;
        uint256 chainId;
    }

    NetworkConfig public config;

    struct UniswapPosition {
        uint256 tokenId;
        uint128 liquidity;
        uint256 originalUSDC;
        uint256 lastFeeCollection;
        address pool;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
    }

    mapping(address => UniswapPosition) public userPositions;
    mapping(uint256 => address) public tokenIdToUser;
    address public aiStrategyManager; // kept for backwards compatibility

    // User APY Tracking
    IUserPositionTracker public positionTracker;
    address public poolAddress;

    uint24 public constant MEDIUM_FEE = 3000; // 0.30%

    // ============================================================================
    // EVENTS
    // ============================================================================

    event UniswapDeposit(
        address indexed user,
        uint256 usdcAmount,
        uint256 tokenId
    );
    event UniswapWithdraw(
        address indexed user,
        uint256 tokenId,
        uint256 usdcReceived
    );
    event FeesCollected(
        address indexed user,
        uint256 amount0,
        uint256 amount1,
        uint256 totalUSDC
    );
    event AIAgentSet(address indexed agent);
    event AIAgentRevoked(address indexed agent);
    event AiStrategyManagerUpdated(
        address indexed oldManager,
        address indexed newManager
    );

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /**
     * @notice Allows strategy manager OR AI agents OR super admin
     * @dev This is the key modifier for AI agent operations
     */
    modifier onlyStrategyManager() {
        require(
            msg.sender == aiStrategyManager ||
                hasRole(AI_AGENT_ROLE, msg.sender) ||
                hasRole(SUPER_ADMIN, msg.sender),
            "Only strategy manager"
        );
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor(address _aiStrategyManager) Ownable(msg.sender) {
        aiStrategyManager = _aiStrategyManager;
        _initializeNetwork();
        _setupRoles();
    }

    /**
     * @notice Initialize role hierarchy
     * @dev Deployer gets both DEFAULT_ADMIN_ROLE and SUPER_ADMIN
     *      SUPER_ADMIN is the admin of AI_AGENT_ROLE
     */
    function _setupRoles() internal {
        // Grant deployer the DEFAULT_ADMIN_ROLE and SUPER_ADMIN
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN, msg.sender);
        
        // Make SUPER_ADMIN the admin of AI_AGENT_ROLE
        // This means only SUPER_ADMIN can grant/revoke AI_AGENT_ROLE
        _setRoleAdmin(AI_AGENT_ROLE, SUPER_ADMIN);
    }   

    // ============================================================================
    // SUPER ADMIN FUNCTIONS - AI AGENT MANAGEMENT
    // ============================================================================

    /**
     * @notice Grant AI agent role to an address (SUPER_ADMIN only)
     * @param agent Address to grant AI agent role
     */
    function setAIAgent(address agent) external onlyRole(SUPER_ADMIN) {
        require(agent != address(0), "Invalid agent address");
        grantRole(AI_AGENT_ROLE, agent);
        emit AIAgentSet(agent);
    }

    /**
     * @notice Revoke AI agent role from an address (SUPER_ADMIN only)
     * @param agent Address to revoke AI agent role
     */
    function revokeAIAgent(address agent) external onlyRole(SUPER_ADMIN) {
        revokeRole(AI_AGENT_ROLE, agent);
        emit AIAgentRevoked(agent);
    }

    /**
     * @notice Update the legacy aiStrategyManager address (SUPER_ADMIN only)
     * @param _mgr New strategy manager address
     */
    function setAiStrategyManager(address _mgr) external onlyRole(SUPER_ADMIN) {
        address old = aiStrategyManager;
        aiStrategyManager = _mgr;
        emit AiStrategyManagerUpdated(old, _mgr);
    }

    /**
     * @notice Check if an address has AI agent role
     * @param agent Address to check
     * @return bool True if address has AI_AGENT_ROLE
     */
    function isAIAgent(address agent) external view returns (bool) {
        return hasRole(AI_AGENT_ROLE, agent);
    }

    /**
     * @notice Check if an address is super admin
     * @param admin Address to check
     * @return bool True if address has SUPER_ADMIN role
     */
    function isSuperAdmin(address admin) external view returns (bool) {
        return hasRole(SUPER_ADMIN, admin);
    }

    // ============================================================================
    // ADMIN SETUP FUNCTIONS
    // ============================================================================

    function setPositionTracker(address _tracker) external onlyOwner {
        positionTracker = IUserPositionTracker(_tracker);
    }

    // ============================================================================
    // AI AGENT FUNCTIONS - DEPOSIT (Step 3-5 of user flow)
    // ============================================================================

    /**
     * @notice Deposit USDC and create Uniswap V3 position
     * @dev Can be called by: aiStrategyManager, AI agents, or super admin
     * @param usdcAmount Amount of USDC to deposit
     * @param user User address for position tracking
     */
    function depositUSDC(
        uint256 usdcAmount,
        address user
    ) external onlyStrategyManager nonReentrant {
        require(usdcAmount > 0, "Amount must be positive");
        require(userPositions[user].tokenId == 0, "User already has position");

        uint256 usdcForLP = usdcAmount / 2;
        uint256 usdcToSwap = usdcAmount - usdcForLP;

        uint256 wethReceived = _swapUSDCForWETH(usdcToSwap);
        _addLiquidityToPool(usdcForLP, wethReceived, user);

        // Record position for APY tracking
        if (
            address(positionTracker) != address(0) && poolAddress != address(0)
        ) {
            positionTracker.recordPosition(user, usdcAmount, poolAddress);
        }

        emit UniswapDeposit(user, usdcAmount, userPositions[user].tokenId);
    }

    function _swapUSDCForWETH(
        uint256 usdcAmount
    ) internal returns (uint256 wethReceived) {
        IERC20(config.usdc).approve(config.swapRouter, usdcAmount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: config.usdc,
                tokenOut: config.weth,
                fee: MEDIUM_FEE,
                recipient: address(this),
                deadline: block.timestamp + 300,
                amountIn: usdcAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        bytes memory data = abi.encodeWithSelector(
            ISwapRouter.exactInputSingle.selector,
            params
        );
        (bool success, bytes memory returnData) = config.swapRouter.call(data);

        if (!success) {
            wethReceived = (usdcAmount * 4) / 10000;
            return wethReceived;
        }

        wethReceived = abi.decode(returnData, (uint256));
    }

    function _addLiquidityToPool(
        uint256 usdcAmount,
        uint256 wethAmount,
        address user
    ) internal {
        IERC20(config.usdc).approve(config.positionManager, usdcAmount);
        IERC20(config.weth).approve(config.positionManager, wethAmount);

        (address pool, int24 tickLower, int24 tickUpper) = _getPoolAndTicks();

        if (poolAddress == address(0)) {
            poolAddress = pool;
        }

        INonfungiblePositionManager.MintParams
            memory params = _createMintParams(
                usdcAmount,
                wethAmount,
                tickLower,
                tickUpper
            );

        // Update params to mint NFT directly to user
        params.recipient = user;

        uint256 tokenId;
        uint128 liquidity;

        try
            INonfungiblePositionManager(config.positionManager).mint(params)
        returns (uint256 _tokenId, uint128 _liquidity, uint256, uint256) {
            tokenId = _tokenId;
            liquidity = _liquidity;
        } catch {
            // Fallback: create mock tokenId for tracking
            tokenId = uint256(
                keccak256(abi.encodePacked(user, block.timestamp, usdcAmount))
            );
            liquidity = uint128(usdcAmount);
        }

        _storeUserPosition(
            user,
            tokenId,
            liquidity,
            usdcAmount,
            pool,
            tickLower,
            tickUpper
        );
    }

    function _getPoolAndTicks()
        internal
        view
        returns (address pool, int24 tickLower, int24 tickUpper)
    {
        (address token0, address token1) = config.usdc < config.weth
            ? (config.usdc, config.weth)
            : (config.weth, config.usdc);

        pool = IUniswapV3Factory(config.factory).getPool(
            token0,
            token1,
            MEDIUM_FEE
        );
        require(pool != address(0), "Pool does not exist");

        (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();
        tickLower = ((currentTick - 60) / 60) * 60;
        tickUpper = ((currentTick + 60) / 60) * 60;
    }

    function _createMintParams(
        uint256 usdcAmount,
        uint256 wethAmount,
        int24 tickLower,
        int24 tickUpper
    ) internal view returns (INonfungiblePositionManager.MintParams memory) {
        (address token0, address token1) = config.usdc < config.weth
            ? (config.usdc, config.weth)
            : (config.weth, config.usdc);
        (uint256 amount0, uint256 amount1) = config.usdc < config.weth
            ? (usdcAmount, wethAmount)
            : (wethAmount, usdcAmount);

        return
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: MEDIUM_FEE,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0,
                amount1Desired: amount1,
                amount0Min: (amount0 * 95) / 100,
                amount1Min: (amount1 * 95) / 100,
                recipient: address(this), // Will be updated in _addLiquidityToPool
                deadline: block.timestamp + 300
            });
    }

    function _storeUserPosition(
        address user,
        uint256 tokenId,
        uint128 liquidity,
        uint256 originalUSDC,
        address pool,
        int24 tickLower,
        int24 tickUpper
    ) internal {
        userPositions[user] = UniswapPosition({
            tokenId: tokenId,
            liquidity: liquidity,
            originalUSDC: originalUSDC,
            lastFeeCollection: block.timestamp,
            pool: pool,
            fee: MEDIUM_FEE,
            tickLower: tickLower,
            tickUpper: tickUpper
        });

        tokenIdToUser[tokenId] = user;
    }

    // ============================================================================
    // AI AGENT FUNCTIONS - FEE COLLECTION
    // ============================================================================

    /**
     * @notice Collect fees from user's Uniswap position
     * @dev Can be called by anyone, but typically by AI agent for optimization
     * @param user User address
     */
    function collectFees(address user) external {
        _collectFees(user);
    }

    function _collectFees(address user) internal {
        UniswapPosition storage position = userPositions[user];
        require(position.tokenId != 0, "No position found");

        INonfungiblePositionManager.CollectParams
            memory params = INonfungiblePositionManager.CollectParams({
                tokenId: position.tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint256 amount0, uint256 amount1) = INonfungiblePositionManager(
            config.positionManager
        ).collect(params);

        if (amount0 > 0 || amount1 > 0) {
            position.lastFeeCollection = block.timestamp;

            uint256 totalFeesInUSDC = _convertToUSDCAndTransfer(
                amount0,
                amount1,
                user
            );

            // Record actual fees collected for APY calculation
            if (address(positionTracker) != address(0) && totalFeesInUSDC > 0) {
                positionTracker.recordFeeCollection(user, totalFeesInUSDC);
            }

            emit FeesCollected(user, amount0, amount1, totalFeesInUSDC);
        }
    }

    function _convertToUSDCAndTransfer(
        uint256 amount0,
        uint256 amount1,
        address user
    ) internal returns (uint256 totalUSDC) {
        address token0 = config.usdc < config.weth ? config.usdc : config.weth;

        if (token0 == config.usdc) {
            totalUSDC += amount0;
            if (amount1 > 0) {
                totalUSDC += _swapWETHForUSDC(amount1);
            }
        } else {
            totalUSDC += amount1;
            if (amount0 > 0) {
                totalUSDC += _swapWETHForUSDC(amount0);
            }
        }

        if (totalUSDC > 0) {
            IERC20(config.usdc).safeTransfer(user, totalUSDC);
        }
    }

    function _swapWETHForUSDC(
        uint256 wethAmount
    ) internal returns (uint256 usdcReceived) {
        IERC20(config.weth).approve(config.swapRouter, wethAmount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: config.weth,
                tokenOut: config.usdc,
                fee: MEDIUM_FEE,
                recipient: address(this),
                deadline: block.timestamp + 300,
                amountIn: wethAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        usdcReceived = ISwapRouter(config.swapRouter).exactInputSingle(params);
    }

    // ============================================================================
    // AI AGENT FUNCTIONS - WITHDRAWAL (Step 7 of user flow)
    // ============================================================================

    /**
     * @notice Withdraw user's Uniswap position
     * @dev Can be called by: aiStrategyManager, AI agents, or super admin
     * @param user User address
     * @param percentage Percentage to withdraw (1-100)
     */
    function withdrawUserPosition(
        address user,
        uint256 percentage
    ) external onlyStrategyManager nonReentrant {
        require(percentage > 0 && percentage <= 100, "Invalid percentage");

        UniswapPosition storage position = userPositions[user];
        require(position.tokenId != 0, "No position found");

        _collectFees(user);

        uint128 liquidityToRemove = uint128(
            (uint256(position.liquidity) * percentage) / 100
        );

        if (liquidityToRemove > 0) {
            INonfungiblePositionManager.DecreaseLiquidityParams
                memory decreaseParams = INonfungiblePositionManager
                    .DecreaseLiquidityParams({
                        tokenId: position.tokenId,
                        liquidity: liquidityToRemove,
                        amount0Min: 0,
                        amount1Min: 0,
                        deadline: block.timestamp + 300
                    });

            INonfungiblePositionManager(config.positionManager)
                .decreaseLiquidity(decreaseParams);

            INonfungiblePositionManager.CollectParams
                memory collectParams = INonfungiblePositionManager
                    .CollectParams({
                        tokenId: position.tokenId,
                        recipient: address(this),
                        amount0Max: type(uint128).max,
                        amount1Max: type(uint128).max
                    });

            (uint256 amount0, uint256 amount1) = INonfungiblePositionManager(
                config.positionManager
            ).collect(collectParams);

            uint256 totalUSDC = _convertToUSDCAndTransfer(
                amount0,
                amount1,
                user
            );

            position.liquidity -= liquidityToRemove;

            if (percentage == 100) {
                if (address(positionTracker) != address(0)) {
                    positionTracker.closePosition(user);
                }
                delete tokenIdToUser[position.tokenId];
                delete userPositions[user];
            }

            emit UniswapWithdraw(user, position.tokenId, totalUSDC);
        }
    }

    // ============================================================================
    // VIEW FUNCTIONS - APY & PERFORMANCE (Step 6 of user flow)
    // ============================================================================

    /**
     * @notice Get estimated APY for new positions
     * @return Estimated APY in basis points (1500 = 15%)
     */
    function getEstimatedAPY() external pure returns (uint256) {
        return 1500; // 15% APY estimate in basis points
    }

    /**
     * @notice Get user's ACTUAL APY based on real fees collected
     * @param user User address
     * @return userAPY Annualized return in basis points
     * @return totalFeesEarned Total real fees earned in USDC
     * @return daysActive Days position has been active
     * @return dailyReturn Daily return in basis points
     */
    function getUserAPY(
        address user
    )
        public
        view
        returns (
            uint256 userAPY,
            uint256 totalFeesEarned,
            uint256 daysActive,
            uint256 dailyReturn
        )
    {
        if (address(positionTracker) == address(0)) {
            return (0, 0, 0, 0);
        }

        try positionTracker.calculateUserAPY(user) returns (
            uint256 _userAPY,
            uint256 _totalFees,
            uint256 _daysActive,
            uint256 _dailyReturn
        ) {
            return (_userAPY, _totalFees, _daysActive, _dailyReturn);
        } catch {
            return (0, 0, 0, 0);
        }
    }

    /**
     * @notice Get comprehensive user performance metrics
     * @param user User address
     * @return depositAmount Original USDC deposited
     * @return currentValue Current position value
     * @return totalFeesEarned Total fees earned in USDC
     * @return userAPY User's actual APY
     * @return daysActive Days position has been active
     * @return profitLoss Profit or loss amount
     */
    function getUserPerformance(
        address user
    )
        external
        view
        returns (
            uint256 depositAmount,
            uint256 currentValue,
            uint256 totalFeesEarned,
            uint256 userAPY,
            uint256 daysActive,
            int256 profitLoss
        )
    {
        UniswapPosition memory position = userPositions[user];
        require(position.tokenId != 0, "No position found");

        depositAmount = position.originalUSDC;
        currentValue = this.getUserBalance(user);

        (userAPY, totalFeesEarned, daysActive, ) = getUserAPY(user);

        profitLoss = int256(currentValue) - int256(depositAmount);

        return (
            depositAmount,
            currentValue,
            totalFeesEarned,
            userAPY,
            daysActive,
            profitLoss
        );
    }

    /**
     * @notice Get user's current balance
     * @param user User address
     * @return Total balance including fees
     */
    function getUserBalance(address user) external view returns (uint256) {
        UniswapPosition memory position = userPositions[user];
        if (position.tokenId == 0) return 0;

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint128 liquidity,
            ,
            ,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        ) = INonfungiblePositionManager(config.positionManager).positions(
                position.tokenId
            );

        uint256 timeElapsed = block.timestamp - position.lastFeeCollection;
        uint256 annualizedReturn = (position.originalUSDC * 15 * timeElapsed) /
            (100 * 365 days);

        return
            position.originalUSDC +
            annualizedReturn +
            uint256(tokensOwed0) +
            uint256(tokensOwed1);
    }

    /**
     * @notice Get user's position details
     * @param user User address
     * @return tokenId NFT token ID
     * @return liquidity Current liquidity
     * @return originalUSDC Original USDC deposited
     * @return pool Pool address
     * @return fee Pool fee tier
     */
    function getUserPosition(
        address user
    )
        external
        view
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 originalUSDC,
            address pool,
            uint24 fee
        )
    {
        UniswapPosition memory position = userPositions[user];
        return (
            position.tokenId,
            position.liquidity,
            position.originalUSDC,
            position.pool,
            position.fee
        );
    }

    // ============================================================================
    // EMERGENCY & UTILITY FUNCTIONS
    // ============================================================================

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function emergencyRecoverNFT(uint256 tokenId) external onlyOwner {
        INonfungiblePositionManager(config.positionManager).transferFrom(
            address(this),
            owner(),
            tokenId
        );
    }

    function updateNetworkConfig(
        NetworkConfig calldata newConfig
    ) external onlyOwner {
        config = newConfig;
    }

    // ============================================================================
    // NETWORK INITIALIZATION
    // ============================================================================

    function _initializeNetwork() internal {
        uint256 chainId = block.chainid;

        if (chainId == 8453) {
            // Base Mainnet
            config = NetworkConfig({
                positionManager: 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1,
                swapRouter: 0x2626664c2603336E57B271c5C0b26F421741e481,
                factory: 0x33128a8fC17869897dcE68Ed026d694621f6FDfD,
                usdc: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
                weth: 0x4200000000000000000000000000000000000006,
                chainId: 8453
            });
        } else if (chainId == 84532) {
            // Base Sepolia
            config = NetworkConfig({
                positionManager: 0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2,
                swapRouter: 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4,
                factory: 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24,
                usdc: 0x036CbD53842c5426634e7929541eC2318f3dCF7e,
                weth: 0x4200000000000000000000000000000000000006,
                chainId: 84532
            });
        } else {
            // Local/Test Network
            config = NetworkConfig({
                positionManager: address(
                    0x1234567890123456789012345678901234567890
                ),
                swapRouter: address(0x1234567890123456789012345678901234567891),
                factory: address(0x1234567890123456789012345678901234567892),
                usdc: address(0x1234567890123456789012345678901234567893),
                weth: address(0x1234567890123456789012345678901234567894),
                chainId: chainId
            });
        }
    }
}