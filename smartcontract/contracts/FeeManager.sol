// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IMIND {
    function burn(uint256 amount) external;
}

interface IMINDStaking {
    function distributeRewards(uint256 amount) external;
}

contract FeeManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Events
    event FeesCollected(address indexed token, uint256 amount);
    event FeesDistributed(uint256 burnAmount, uint256 stakersAmount, uint256 devAmount);
    event TokenBuyback(address indexed token, uint256 tokenAmount, uint256 mindAmount);
    
    // State variables
    IERC20 public immutable mindToken;
    IMINDStaking public immutable mindStaking;
    
    // Fee distribution percentages (basis points)
    uint256 public constant BURN_PERCENTAGE = 5000;      // 50%
    uint256 public constant STAKERS_PERCENTAGE = 2500;   // 25%
    uint256 public constant DEV_PERCENTAGE = 2500;       // 25%
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;
    
    // Collected fees by token
    mapping(address => uint256) public collectedFees;
    
    // Treasury addresses
    address public devTreasury;
    address public buybackTreasury;
    
    // DEX router for buybacks (Uniswap V2 style)
    address public dexRouter;
    
    // Minimum threshold for automatic distribution
    mapping(address => uint256) public distributionThresholds;
    
    constructor(
        address _mindToken,
        address _mindStaking,
        address _devTreasury,
        address _dexRouter
    ) Ownable(msg.sender) {
        mindToken = IERC20(_mindToken);
        mindStaking = IMINDStaking(_mindStaking);
        devTreasury = _devTreasury;
        dexRouter = _dexRouter;
        buybackTreasury = address(this);
    }
    
    /**
     * @dev Collect performance fees from vault
     */
    function collectFees(address token, uint256 amount) external {
        require(amount > 0, "No fees to collect");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        collectedFees[token] += amount;
        
        emit FeesCollected(token, amount);
        
        // Auto-distribute if threshold met
        if (collectedFees[token] >= distributionThresholds[token]) {
            _distributeFees(token);
        }
    }
    
    /**
     * @dev Manually distribute collected fees
     */
    function distributeFees(address token) external nonReentrant {
        _distributeFees(token);
    }
    
    /**
     * @dev Internal fee distribution logic
     */
    function _distributeFees(address token) internal {
        uint256 totalFees = collectedFees[token];
        require(totalFees > 0, "No fees to distribute");
        
        collectedFees[token] = 0;
        
        // Calculate distribution amounts
        uint256 burnAmount = (totalFees * BURN_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        uint256 stakersAmount = (totalFees * STAKERS_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        uint256 devAmount = totalFees - burnAmount - stakersAmount;
        
        if (token == address(mindToken)) {
            // Direct MIND token distribution
            _distributeMindFees(burnAmount, stakersAmount, devAmount);
        } else {
            // Convert other tokens to MIND first
            _convertAndDistribute(token, burnAmount, stakersAmount, devAmount);
        }
        
        emit FeesDistributed(burnAmount, stakersAmount, devAmount);
    }
    
    /**
     * @dev Distribute MIND token fees directly
     */
    function _distributeMindFees(
        uint256 burnAmount,
        uint256 stakersAmount,
        uint256 devAmount
    ) internal {
        // Burn MIND tokens
        if (burnAmount > 0) {
            IMIND(address(mindToken)).burn(burnAmount);
        }
        
        // Send to stakers
        if (stakersAmount > 0) {
            mindToken.approve(address(mindStaking), stakersAmount);
            mindStaking.distributeRewards(stakersAmount);
        }
        
        // Send to dev treasury
        if (devAmount > 0) {
            mindToken.safeTransfer(devTreasury, devAmount);
        }
    }
    
    /**
     * @dev Convert other tokens to MIND and distribute
     */
    function _convertAndDistribute(
        address token,
        uint256 burnAmount,
        uint256 stakersAmount,
        uint256 devAmount
    ) internal {
        // Buyback MIND with collected fees
        uint256 totalAmount = burnAmount + stakersAmount + devAmount;
        uint256 mindReceived = _buybackMind(token, totalAmount);
        
        if (mindReceived > 0) {
            // Redistribute proportionally
            uint256 mindForBurn = (mindReceived * BURN_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
            uint256 mindForStakers = (mindReceived * STAKERS_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
            uint256 mindForDev = mindReceived - mindForBurn - mindForStakers;
            
            _distributeMindFees(mindForBurn, mindForStakers, mindForDev);
        }
    }
    
    /**
     * @dev Execute MIND token buyback on DEX
     */
    function _buybackMind(address token, uint256 amount) internal returns (uint256) {
        if (dexRouter == address(0) || amount == 0) return 0;
        
        // Approve DEX router
        IERC20(token).approve(dexRouter, amount);
        
        // Create swap path: token -> WETH -> MIND
        address[] memory path = new address[](3);
        path[0] = token;
        path[1] = _getWETH(); // Get WETH address from router
        path[2] = address(mindToken);
        
        uint256 mindBefore = mindToken.balanceOf(address(this));
        
        // Execute swap (simplified - real implementation would use proper DEX interface)
        // IDEXRouter(dexRouter).swapExactTokensForTokens(
        //     amount,
        //     0, // Accept any amount of MIND
        //     path,
        //     address(this),
        //     block.timestamp + 300
        // );
        
        uint256 mindAfter = mindToken.balanceOf(address(this));
        uint256 mindReceived = mindAfter - mindBefore;
        
        emit TokenBuyback(token, amount, mindReceived);
        
        return mindReceived;
    }
    
    /**
     * @dev Set distribution threshold for token
     */
    function setDistributionThreshold(address token, uint256 threshold) external onlyOwner {
        distributionThresholds[token] = threshold;
    }
    
    /**
     * @dev Update dev treasury address
     */
    function setDevTreasury(address _devTreasury) external onlyOwner {
        require(_devTreasury != address(0), "Invalid treasury address");
        devTreasury = _devTreasury;
    }
    
    /**
     * @dev Update DEX router for buybacks
     */
    function setDexRouter(address _dexRouter) external onlyOwner {
        dexRouter = _dexRouter;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
    
    /**
     * @dev Get WETH address from DEX router
     */
    function _getWETH() internal pure returns (address) {
        // This would call the actual router's WETH() function
        // For now, return a placeholder
        return 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // Mainnet WETH
    }
    
    /**
     * @dev Get collected fees for token
     */
    function getCollectedFees(address token) external view returns (uint256) {
        return collectedFees[token];
    }
}