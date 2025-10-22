// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseProtocolIntegration
 * @dev Professional integration with real Base DeFi protocols
 * This contract interfaces with actual protocols on Base mainnet
 */
contract BaseProtocolIntegration is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Events
    event ProtocolIntegrated(address indexed protocol, string name, bool isRealProtocol);
    event DepositExecuted(address indexed user, address indexed protocol, uint256 amount);
    event WithdrawalExecuted(address indexed user, address indexed protocol, uint256 amount);
    event YieldGenerated(address indexed user, address indexed protocol, uint256 amount);
    
    // Protocol information
    struct ProtocolInfo {
        address protocolAddress;
        string name;
        string protocolType; // "lending", "dex", "yield-farm", "staking"
        bool isRealProtocol; // true if real protocol, false if mock
        bool supportsNativeToken;
        bool isActive;
        uint256 lastUpdate;
        uint256 currentAPY; // In basis points
        uint256 riskScore; // 1-100
    }
    
    // User positions
    struct UserPosition {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 currentBalance;
        uint256 lastUpdate;
        mapping(address => uint256) protocolBalances; // protocol => balance
    }
    
    mapping(address => ProtocolInfo) public protocols;
    mapping(address => UserPosition) public userPositions;
    address[] public protocolList;
    
    // Real Base Protocol Addresses
    address public constant AAVE_V3_POOL = address(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2); // Aave V3 Pool on Base
    address public constant COMPOUND_III_COMET = address(0x46e6b214b524310239732D51387075E0e70970bf); // Compound III Comet on Base
    address public constant MOONWELL_LENDING = address(0x7aE77149ed38D5D2b2768C4a8e6782e1B419f89C); // Moonwell Lending Pool
    address public constant AERODROME_ROUTER = address(0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43); // Aerodrome Router
    address public constant UNISWAP_V3_FACTORY = address(0x33128a8fC17869897dcE68Ed026d694621f6FDfD); // Uniswap V3 Factory on Base
    
    // Oracle integration for real-time data
    address public priceOracle;
    address public apyOracle;
    
    modifier onlyActiveProtocol(address protocol) {
        require(protocols[protocol].isActive, "Protocol not active");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        _initializeRealBaseProtocols();
    }
    
    /**
     * @dev Initialize real Base protocols
     * This will be updated with actual protocol addresses
     */
    function _initializeRealBaseProtocols() internal {
        // Initialize real Base DeFi protocols
        
        // Aave V3 Lending Protocol
        _addProtocol(
            AAVE_V3_POOL,
            "Aave V3 Lending Pool",
            "lending",
            true, // Real protocol
            false, // ERC20 only (USDC)
            800, // 8% APY (typical lending rate)
            15    // Low risk
        );
        
        // Compound III Money Market
        _addProtocol(
            COMPOUND_III_COMET,
            "Compound III Comet",
            "lending",
            true, // Real protocol
            false, // ERC20 only (USDC)
            600, // 6% APY (typical lending rate)
            20    // Low risk
        );
        
        // Moonwell Lending Protocol
        _addProtocol(
            MOONWELL_LENDING,
            "Moonwell Lending Pool",
            "lending",
            true, // Real protocol
            false, // ERC20 only (USDC)
            1000, // 10% APY
            25    // Low-medium risk
        );
        
        // Aerodrome Finance DEX
        _addProtocol(
            AERODROME_ROUTER,
            "Aerodrome Finance DEX",
            "dex",
            true, // Real protocol
            false, // ERC20 only
            2500, // 25% APY (typical DEX yield)
            45    // Medium risk
        );
        
        // Uniswap V3 DEX
        _addProtocol(
            UNISWAP_V3_FACTORY,
            "Uniswap V3 DEX",
            "dex",
            true, // Real protocol
            false, // ERC20 only
            2000, // 20% APY (typical DEX yield)
            40    // Medium risk
        );
    }
    
    /**
     * @dev Add a protocol (real or mock)
     */
    function _addProtocol(
        address protocolAddress,
        string memory name,
        string memory protocolType,
        bool isRealProtocol,
        bool supportsNativeToken,
        uint256 initialAPY,
        uint256 riskScore
    ) internal {
        protocols[protocolAddress] = ProtocolInfo({
            protocolAddress: protocolAddress,
            name: name,
            protocolType: protocolType,
            isRealProtocol: isRealProtocol,
            supportsNativeToken: supportsNativeToken,
            isActive: true,
            lastUpdate: block.timestamp,
            currentAPY: initialAPY,
            riskScore: riskScore
        });
        
        protocolList.push(protocolAddress);
        
        emit ProtocolIntegrated(protocolAddress, name, isRealProtocol);
    }
    
    /**
     * @dev Deposit to a specific protocol
     * Handles both real and mock protocols
     */
    function depositToProtocol(
        address protocol,
        address token,
        uint256 amount
    ) external payable nonReentrant onlyActiveProtocol(protocol) returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        
        ProtocolInfo memory protocolInfo = protocols[protocol];
        
        if (protocolInfo.isRealProtocol) {
            return _depositToRealProtocol(protocol, token, amount);
        } else {
            return _depositToMockProtocol(protocol, token, amount);
        }
    }
    
    /**
     * @dev Deposit to real Base protocol
     */
    function _depositToRealProtocol(
        address protocol,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        ProtocolInfo memory protocolInfo = protocols[protocol];
        
        if (token == address(0)) {
            // Native token deposit
            require(protocolInfo.supportsNativeToken, "Protocol doesn't support native tokens");
            require(msg.value == amount, "Incorrect native token amount");
            
            // Call real protocol's deposit function
            (bool success, bytes memory data) = protocol.call{value: amount}(
                abi.encodeWithSignature("deposit()")
            );
            require(success, "Real protocol deposit failed");
            
            // Decode return value (shares or amount)
            uint256 shares = abi.decode(data, (uint256));
            
            // Update user position
            _updateUserPosition(msg.sender, protocol, amount, 0);
            
            emit DepositExecuted(msg.sender, protocol, amount);
            return shares;
            
        } else {
            // ERC20 token deposit
            require(!protocolInfo.supportsNativeToken, "Protocol only supports native tokens");
            
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(protocol, amount);
            
            // Call real protocol's deposit function
            (bool success, bytes memory data) = protocol.call(
                abi.encodeWithSignature("deposit(address,uint256)", token, amount)
            );
            require(success, "Real protocol deposit failed");
            
            uint256 shares = abi.decode(data, (uint256));
            
            _updateUserPosition(msg.sender, protocol, amount, 0);
            
            emit DepositExecuted(msg.sender, protocol, amount);
            return shares;
        }
    }
    
    /**
     * @dev Deposit to mock protocol (fallback)
     */
    function _depositToMockProtocol(
        address protocol,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        // This would interact with our MockBaseProtocol
        // Implementation similar to previous mock protocol logic
        
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect native token amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        
        _updateUserPosition(msg.sender, protocol, amount, 0);
        
        emit DepositExecuted(msg.sender, protocol, amount);
        return amount; // 1:1 shares for mock
    }
    
    /**
     * @dev Withdraw from protocol
     */
    function withdrawFromProtocol(
        address protocol,
        address token,
        uint256 amount
    ) external nonReentrant onlyActiveProtocol(protocol) returns (uint256) {
        ProtocolInfo memory protocolInfo = protocols[protocol];
        
        if (protocolInfo.isRealProtocol) {
            return _withdrawFromRealProtocol(protocol, token, amount);
        } else {
            return _withdrawFromMockProtocol(protocol, token, amount);
        }
    }
    
    /**
     * @dev Withdraw from real protocol
     */
    function _withdrawFromRealProtocol(
        address protocol,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        // Call real protocol's withdraw function
        (bool success, bytes memory data) = protocol.call(
            abi.encodeWithSignature("withdraw(uint256)", amount)
        );
        require(success, "Real protocol withdrawal failed");
        
        uint256 withdrawnAmount = abi.decode(data, (uint256));
        
        // Handle token transfer
        if (token == address(0)) {
            (bool transferSuccess, ) = msg.sender.call{value: withdrawnAmount}("");
            require(transferSuccess, "Native token transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, withdrawnAmount);
        }
        
        _updateUserPosition(msg.sender, protocol, 0, withdrawnAmount);
        
        emit WithdrawalExecuted(msg.sender, protocol, withdrawnAmount);
        return withdrawnAmount;
    }
    
    /**
     * @dev Withdraw from mock protocol
     */
    function _withdrawFromMockProtocol(
        address protocol,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        // Mock withdrawal logic
        uint256 withdrawnAmount = amount;
        
        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: withdrawnAmount}("");
            require(success, "Native token transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, withdrawnAmount);
        }
        
        _updateUserPosition(msg.sender, protocol, 0, withdrawnAmount);
        
        emit WithdrawalExecuted(msg.sender, protocol, withdrawnAmount);
        return withdrawnAmount;
    }
    
    /**
     * @dev Update user position
     */
    function _updateUserPosition(
        address user,
        address protocol,
        uint256 deposited,
        uint256 withdrawn
    ) internal {
        UserPosition storage position = userPositions[user];
        
        if (deposited > 0) {
            position.totalDeposited += deposited;
            position.protocolBalances[protocol] += deposited;
        }
        
        if (withdrawn > 0) {
            position.totalWithdrawn += withdrawn;
            position.protocolBalances[protocol] -= withdrawn;
        }
        
        position.currentBalance = position.totalDeposited - position.totalWithdrawn;
        position.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Get user's balance in a specific protocol
     */
    function getUserProtocolBalance(address user, address protocol) 
        external 
        view 
        returns (uint256) 
    {
        return userPositions[user].protocolBalances[protocol];
    }
    
    /**
     * @dev Get user's total balance across all protocols
     */
    function getUserTotalBalance(address user) external view returns (uint256) {
        return userPositions[user].currentBalance;
    }
    
    /**
     * @dev Update protocol APY from oracle
     */
    function updateProtocolAPY(address protocol, uint256 newAPY) external {
        require(msg.sender == apyOracle || msg.sender == owner(), "Unauthorized");
        require(protocols[protocol].protocolAddress != address(0), "Protocol not found");
        
        protocols[protocol].currentAPY = newAPY;
        protocols[protocol].lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Set oracle addresses
     */
    function setOracles(address _priceOracle, address _apyOracle) external onlyOwner {
        priceOracle = _priceOracle;
        apyOracle = _apyOracle;
    }
    
    /**
     * @dev Add new protocol (admin function)
     */
    function addProtocol(
        address protocolAddress,
        string memory name,
        string memory protocolType,
        bool isRealProtocol,
        bool supportsNativeToken,
        uint256 initialAPY,
        uint256 riskScore
    ) external onlyOwner {
        _addProtocol(
            protocolAddress,
            name,
            protocolType,
            isRealProtocol,
            supportsNativeToken,
            initialAPY,
            riskScore
        );
    }
    
    /**
     * @dev Get all protocols
     */
    function getAllProtocols() external view returns (ProtocolInfo[] memory) {
        ProtocolInfo[] memory allProtocols = new ProtocolInfo[](protocolList.length);
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            allProtocols[i] = protocols[protocolList[i]];
        }
        
        return allProtocols;
    }
    
    /**
     * @dev Receive function for native token handling
     */
    receive() external payable {
        // Allow contract to receive native tokens
    }
}
