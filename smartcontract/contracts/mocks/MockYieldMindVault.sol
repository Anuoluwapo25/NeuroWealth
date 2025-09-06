// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockYieldMindVault {
    address public mockUser;
    
    function setMockUser(address user) external {
        mockUser = user;
    }
    
    function updatePositionValue(address user, uint256 newValue) external {
        // Mock implementation - in real contract this would update user position
    }
}
