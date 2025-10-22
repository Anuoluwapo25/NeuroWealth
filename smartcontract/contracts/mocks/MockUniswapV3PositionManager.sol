// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Mock interface for testing
interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }
}

/// @notice Mock version of Uniswap V3 Position Manager for testing only
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

        _mint(params.recipient, tokenId);

        if (amount0 > 0) {
            IERC20(params.token0).transferFrom(
                msg.sender,
                address(this),
                amount0
            );
        }
        if (amount1 > 0) {
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

        if (amount0 > 0) {
            IERC20(pos.token0).transfer(params.recipient, amount0);
        }
        if (amount1 > 0) {
            IERC20(pos.token1).transfer(params.recipient, amount1);
        }
    }

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
            0,
            address(0),
            pos.token0,
            pos.token1,
            pos.fee,
            pos.tickLower,
            pos.tickUpper,
            pos.liquidity,
            0,
            0,
            100,
            100
        );
    }

    function decreaseLiquidity(
        INonfungiblePositionManager.DecreaseLiquidityParams calldata params
    ) external returns (uint256 amount0, uint256 amount1) {
        Position storage pos = positionsData[params.tokenId];

        if (pos.liquidity >= params.liquidity) {
            pos.liquidity -= params.liquidity;
        } else {
            pos.liquidity = 0;
        }

        amount0 = uint256(params.liquidity) / 2;
        amount1 = uint256(params.liquidity) / 2;
    }

    function increaseLiquidity(
        INonfungiblePositionManager.IncreaseLiquidityParams calldata params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        Position storage pos = positionsData[params.tokenId];

        liquidity = uint128(params.amount0Desired + params.amount1Desired);
        pos.liquidity += liquidity;
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;

        if (amount0 > 0) {
            IERC20(pos.token0).transferFrom(msg.sender, address(this), amount0);
        }
        if (amount1 > 0) {
            IERC20(pos.token1).transferFrom(msg.sender, address(this), amount1);
        }
    }

    function getPosition(
        uint256 tokenId
    ) external view returns (Position memory) {
        return positionsData[tokenId];
    }
}
