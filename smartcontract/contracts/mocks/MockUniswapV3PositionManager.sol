// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../UniswapV3StrategyAdapter.sol";

contract MockUniswapV3PositionManager is ERC721 {
    uint256 private _tokenIdCounter = 1;

    struct Position {
        uint128 liquidity;
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
    }

    mapping(uint256 => Position) public positionsData;

    constructor() ERC721("MockUniswapV3Positions", "UNI-V3-POS") {}

    function mint(
        INonfungiblePositionManager.MintParams calldata params
    )
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        tokenId = _tokenIdCounter++;

        // Fix: Use the desired amounts, not the sum
        liquidity = uint128(params.amount0Desired + params.amount1Desired);
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;

        positionsData[tokenId] = Position({
            liquidity: liquidity,
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper
        });

        // Mint NFT to recipient
        _mint(params.recipient, tokenId);

        // Transfer tokens safely
        if (IERC20(params.token0).balanceOf(msg.sender) >= amount0) {
            IERC20(params.token0).transferFrom(
                msg.sender,
                address(this),
                amount0
            );
        }
        if (IERC20(params.token1).balanceOf(msg.sender) >= amount1) {
            IERC20(params.token1).transferFrom(
                msg.sender,
                address(this),
                amount1
            );
        }
    }

    function collect(
        INonfungiblePositionManager.CollectParams calldata params
    ) external returns (uint256 amount0, uint256 amount1) {
        Position memory pos = positionsData[params.tokenId];
        amount0 = pos.liquidity / 100;
        amount1 = pos.liquidity / 100;

        // Transfer collected fees if tokens are available
        if (IERC20(pos.token0).balanceOf(address(this)) >= amount0) {
            IERC20(pos.token0).transfer(params.recipient, amount0);
        }
        if (IERC20(pos.token1).balanceOf(address(this)) >= amount1) {
            IERC20(pos.token1).transfer(params.recipient, amount1);
        }
    }

    // This is the missing function that was causing the test failures
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
        )
    {
        Position memory pos = positionsData[tokenId];

        return (
            0, // nonce
            address(0), // operator
            pos.token0, // token0
            pos.token1, // token1
            pos.fee, // fee
            pos.tickLower, // tickLower
            pos.tickUpper, // tickUpper
            pos.liquidity, // liquidity
            0, // feeGrowthInside0LastX128
            0, // feeGrowthInside1LastX128
            100, // tokensOwed0 (mock fee amount)
            100 // tokensOwed1 (mock fee amount)
        );
    }

    // Add decreaseLiquidity function for withdrawal tests
    function decreaseLiquidity(
        INonfungiblePositionManager.DecreaseLiquidityParams calldata params
    ) external returns (uint256 amount0, uint256 amount1) {
        Position storage pos = positionsData[params.tokenId];

        // Reduce liquidity
        if (pos.liquidity >= params.liquidity) {
            pos.liquidity -= params.liquidity;
        } else {
            pos.liquidity = 0;
        }

        // Return mock amounts
        amount0 = uint256(params.liquidity) / 2;
        amount1 = uint256(params.liquidity) / 2;

        return (amount0, amount1);
    }

    // Add increaseLiquidity function for completeness
    function increaseLiquidity(
        INonfungiblePositionManager.IncreaseLiquidityParams calldata params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        Position storage pos = positionsData[params.tokenId];

        liquidity = uint128(params.amount0Desired + params.amount1Desired);
        pos.liquidity += liquidity;
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;

        // Transfer tokens if available
        if (IERC20(pos.token0).balanceOf(msg.sender) >= amount0) {
            IERC20(pos.token0).transferFrom(msg.sender, address(this), amount0);
        }
        if (IERC20(pos.token1).balanceOf(msg.sender) >= amount1) {
            IERC20(pos.token1).transferFrom(msg.sender, address(this), amount1);
        }
    }

    // Helper function to get position data (simplified)
    function getPosition(
        uint256 tokenId
    ) external view returns (Position memory) {
        return positionsData[tokenId];
    }

    // Note: ERC721 transfer functions are inherited and work automatically
    // No need to override them since they're not virtual in OpenZeppelin's implementation
}
