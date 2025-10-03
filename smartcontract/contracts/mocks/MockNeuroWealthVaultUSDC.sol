// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

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

    function withdraw(
        address token,
        uint256 amount
    ) external returns (uint256) {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        return amount;
    }

    function getBalance(
        address user,
        address token
    ) external view returns (uint256) {
        return balances[user][token];
    }
}
