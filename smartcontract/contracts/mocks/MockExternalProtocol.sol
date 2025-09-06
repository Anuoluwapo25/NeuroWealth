// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockExternalProtocol {
    string public name;
    uint256 public currentAPY;
    uint256 public riskScore;
    
    mapping(address => mapping(address => uint256)) public balances;
    
    constructor(string memory _name, uint256 _apy, uint256 _riskScore) {
        name = _name;
        currentAPY = _apy;
        riskScore = _riskScore;
    }
    
    function deposit(address token, uint256 amount) external returns (uint256) {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][token] += amount;
        return amount;
    }
    
    function withdraw(address token, uint256 amount) external returns (uint256) {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        return amount;
    }
    
    function getBalance(address user, address token) external view returns (uint256) {
        return balances[user][token];
    }
    
    function updateAPY(uint256 newAPY) external {
        currentAPY = newAPY;
    }
    
    function updateRiskScore(uint256 newRiskScore) external {
        riskScore = newRiskScore;
    }
}
