const { ethers } = require("hardhat");

describe("Uniswap V2 Fork Test", function () {
  it("impersonates a USDC whale and swaps USDC for WETH", async function () {
    const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // mainnet USDC
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet WETH

    // pick a whale (big USDC holder)
    const whale = "0x55fe002aeff02f77364de339a1292923a15844b8"; // USDC-rich address

    // 1. impersonate whale
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whale],
    });
    const whaleSigner = await ethers.getSigner(whale);

    // 2. give whale ETH for gas
    await hre.network.provider.send("hardhat_setBalance", [
      whale,
      ethers.utils.parseEther("1000").toHexString(),
    ]);

    // 3. attach contracts
    const usdc = await ethers.getContractAt("IERC20", USDC, whaleSigner);
    const weth = await ethers.getContractAt("IERC20", WETH, whaleSigner);
    const router = await ethers.getContractAt("IUniswapV2Router02", UNISWAP_V2_ROUTER, whaleSigner);

    // 4. approve router
    const amountIn = ethers.utils.parseUnits("1000", 6); // 1000 USDC (6 decimals)
    await usdc.approve(UNISWAP_V2_ROUTER, amountIn);

    // 5. run swap
    const amountsOut = await router.getAmountsOut(amountIn, [USDC, WETH]);
    const minOut = amountsOut[1].mul(90).div(100); // 10% slippage tolerance

    await router.swapExactTokensForTokens(
      amountIn,
      minOut,
      [USDC, WETH],
      whale,
      Math.floor(Date.now() / 1000) + 60 * 10
    );

    // 6. check balances
    const wethBalance = await weth.balanceOf(whale);
    console.log("WETH received:", ethers.utils.formatEther(wethBalance));
  });
});
