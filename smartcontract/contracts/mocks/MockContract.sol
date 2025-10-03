// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockNeuroWealthVault {
    address public mockUser;

    function setMockUser(address _user) external {
        mockUser = _user;
    }

    function approveToken(
        address token,
        address spender,
        uint256 amount
    ) external {
        IERC20(token).approve(spender, amount);
    }

    function callExecuteStrategy(
        address strategyManager,
        uint256 amount,
        address token
    ) external {
        IERC20(token).approve(strategyManager, amount);

        (bool success, ) = strategyManager.call(
            abi.encodeWithSignature(
                "executeStrategy(uint256,address)",
                amount,
                token
            )
        );
        require(success, "Strategy execution failed");
    }

    function executeStrategy(uint256, address) external pure {
        // Mock implementation - does nothing
    }
}