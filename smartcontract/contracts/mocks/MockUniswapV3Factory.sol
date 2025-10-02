// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUniswapV3Factory {
    address public mockPool;
    
    // Allow setting the pool address
    function setMockPool(address _pool) external {
        mockPool = _pool;
    }
    
    function getPool(address, address, uint24) external view returns (address) {
        return mockPool;
    }
}