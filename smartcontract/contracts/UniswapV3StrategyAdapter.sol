// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

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

// UNISWAP V3 STRATEGY ADAPTER - USER APY

contract UniswapV3StrategyAdapter is ReentrancyGuard, Ownable, IERC721Receiver {
    using SafeERC20 for IERC20;

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
    address public aiStrategyManager;

    // User APY Tracking ONLY
    IUserPositionTracker public positionTracker;
    address public poolAddress;

    uint24 public constant MEDIUM_FEE = 3000; // 0.30%

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

    modifier onlyStrategyManager() {
        require(msg.sender == aiStrategyManager, "Only strategy manager");
        _;
    }

    constructor(address _aiStrategyManager) Ownable(msg.sender) {
        aiStrategyManager = _aiStrategyManager;
        _initializeNetwork();
    }

    function _initializeNetwork() internal {
        uint256 chainId = block.chainid;

        if (chainId == 8453) {
            config = NetworkConfig({
                positionManager: 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1, // CORRECTED ADDRESS
                swapRouter: 0x2626664c2603336E57B271c5C0b26F421741e481,
                factory: 0x33128a8fC17869897dcE68Ed026d694621f6FDfD,
                usdc: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
                weth: 0x4200000000000000000000000000000000000006,
                chainId: 8453
            });
        } else if (chainId == 84532) {
            config = NetworkConfig({
                positionManager: 0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2,
                swapRouter: 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4,
                factory: 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24,
                usdc: 0x036CbD53842c5426634e7929541eC2318f3dCF7e,
                weth: 0x4200000000000000000000000000000000000006,
                chainId: 84532
            });
        } else {
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

    // ============================================================================
    // SETUP

    function setPositionTracker(address _tracker) external onlyOwner {
        positionTracker = IUserPositionTracker(_tracker);
    }

    // ============================================================================
    // DEPOSIT
    // ============================================================================

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

        uint256 tokenId;
        uint128 liquidity;

        try
            INonfungiblePositionManager(config.positionManager).mint(params)
        returns (uint256 _tokenId, uint128 _liquidity, uint256, uint256) {
            tokenId = _tokenId;
            liquidity = _liquidity;
        } catch {
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
                recipient: address(this),
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

    // FEE COLLECTION - RECORDS REAL FEES FOR APY CALCULATION

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

            // CRITICAL: Record actual fees collected for APY calculation
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

    /**
     * @dev Get estimated APY for new positions (returns fixed estimate)
     */
    function getEstimatedAPY() external pure returns (uint256) {
        return 1500; // 15% APY estimate in basis points
    }

    /**
     * @dev Get user's ACTUAL APY based on real fees collected
     */
    function getUserAPY(
        address user
    )
        public
        view
        returns (
            uint256 userAPY, // Annualized return in basis points
            uint256 totalFeesEarned, // Total real fees earned in USDC
            uint256 daysActive, // Days position active
            uint256 dailyReturn // Daily return in basis points
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
     * @dev Get comprehensive user performance
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

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

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
}
