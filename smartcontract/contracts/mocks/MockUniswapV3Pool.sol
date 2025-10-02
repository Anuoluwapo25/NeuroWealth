// contracts/mocks/MockUniswapV3Pool.sol - Replace your current one with this
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUniswapV3Pool {
    function slot0()
        external
        pure
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        return (
            79228162514264337593543950336, // sqrt(1) * 2^96
            0, // tick = 0
            0, // observationIndex
            1, // observationCardinality
            1, // observationCardinalityNext
            0, // feeProtocol
            true // unlocked
        );
    }

    function fee() external pure returns (uint24) {
        return 3000;
    }

    function token0() external pure returns (address) {
        return address(0x1111111111111111111111111111111111111111);
    }

    function token1() external pure returns (address) {
        return address(0x2222222222222222222222222222222222222222);
    }
}
