// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Simplified interface for testing
interface ISimpleSwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract SimplifiedUniswapAdapter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event UniswapDeposit(address indexed user, uint256 usdcAmount);
    event UniswapWithdraw(address indexed user, uint256 usdcReceived);
    event FeesCollected(address indexed user, uint256 amount);

    // State
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userOriginalDeposits;

    address public immutable USDC;
    address public immutable WETH;
    address public swapRouter;
    address public aiStrategyManager;

    // Simple 15% APY simulation
    uint256 public constant SIMULATED_APY = 1500; // 15% in basis points
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    modifier onlyStrategyManager() {
        require(msg.sender == aiStrategyManager, "Only strategy manager");
        _;
    }

    constructor(
        address _usdc,
        address _weth,
        address _swapRouter,
        address _aiStrategyManager
    ) Ownable(msg.sender) {
        USDC = _usdc;
        WETH = _weth;
        swapRouter = _swapRouter;
        aiStrategyManager = _aiStrategyManager;
    }

    /**
     * @dev Update AI Strategy Manager address
     */
    function updateStrategyManager(
        address _newStrategyManager
    ) external onlyOwner {
        aiStrategyManager = _newStrategyManager;
    }

    /**
     * @dev Deposit USDC and simulate Uniswap interaction
     */
    function depositUSDC(
        uint256 usdcAmount,
        address user
    ) external onlyStrategyManager nonReentrant {
        require(usdcAmount > 0, "Amount must be positive");
        require(userBalances[user] == 0, "User already has position");

        // Store original deposit
        userOriginalDeposits[user] = usdcAmount;
        userBalances[user] = usdcAmount;

        // Simulate swapping half USDC to WETH (for testing)
        // In real implementation, this would call Uniswap router
        uint256 usdcToSwap = usdcAmount / 2;
        uint256 wethReceived = _simulateSwap(usdcToSwap);

        // Simulate providing liquidity (just store the balance for now)
        // In real implementation, this would create Uniswap V3 position
        // For now, we just simulate that the swap and LP provision worked
        require(wethReceived > 0, "Swap simulation failed");

        emit UniswapDeposit(user, usdcAmount);
    }

    /**
     * @dev Simulate USDC to WETH swap (for testing)
     */
    function _simulateSwap(
        uint256 usdcAmount
    ) internal pure returns (uint256 wethReceived) {
        // Simple simulation: 1 USDC = 0.0004 ETH (roughly $2500 ETH price)
        // This is just for testing - real implementation would call router
        wethReceived = (usdcAmount * 4) / 10000; // 0.0004 ETH per USDC
    }

    /**
     * @dev Withdraw user position
     */
    function withdrawUserPosition(
        address user,
        uint256 percentage
    ) external onlyStrategyManager nonReentrant {
        require(percentage > 0 && percentage <= 100, "Invalid percentage");
        require(userBalances[user] > 0, "No position found");

        uint256 currentBalance = getUserBalance(user);
        uint256 withdrawAmount = (currentBalance * percentage) / 100;

        // Update balances
        userBalances[user] -= withdrawAmount;
        if (percentage == 100) {
            delete userOriginalDeposits[user];
        }

        // Transfer USDC back to user
        IERC20(USDC).safeTransfer(user, withdrawAmount);

        emit UniswapWithdraw(user, withdrawAmount);
    }

    /**
     * @dev Get user's current balance including simulated gains
     */
    function getUserBalance(address user) public view returns (uint256) {
        uint256 originalDeposit = userOriginalDeposits[user];
        if (originalDeposit == 0) return 0;

        uint256 timeElapsed = block.timestamp - block.timestamp; // This would be actual time
        uint256 simulatedGains = (originalDeposit *
            SIMULATED_APY *
            timeElapsed) / (SECONDS_PER_YEAR * 10000);

        return originalDeposit + simulatedGains;
    }

    /**
     * @dev Collect fees (simulated)
     */
    function collectFees(address user) external {
        uint256 originalDeposit = userOriginalDeposits[user];
        require(originalDeposit > 0, "No position found");

        // Simulate fee collection
        uint256 fees = (originalDeposit * 50) / 10000; // 0.5% fee
        userBalances[user] += fees;

        emit FeesCollected(user, fees);
    }

    /**
     * @dev Get estimated APY
     */
    function getEstimatedAPY() external pure returns (uint256) {
        return SIMULATED_APY; // 15%
    }

    /**
     * @dev Update swap router (for testing different networks)
     */
    function updateSwapRouter(address _newRouter) external onlyOwner {
        swapRouter = _newRouter;
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
