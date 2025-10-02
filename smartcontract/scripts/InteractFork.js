// scripts/interactFork.js
const { ethers } = require("hardhat");

async function main() {
    console.log("Testing on forked Base mainnet...\n");

    const [deployer] = await ethers.getSigners();

    // Base Mainnet USDC
    const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

    // Deploy all contracts
    console.log("=== Deploying Contracts ===");

    const MIND = await ethers.getContractFactory("MIND");
    const mindToken = await MIND.deploy();
    await mindToken.waitForDeployment();
    console.log("✓ MIND:", mindToken.target);

    const MINDStaking = await ethers.getContractFactory("MINDStaking");
    const staking = await MINDStaking.deploy(mindToken.target);
    await staking.waitForDeployment();
    console.log("✓ Staking:", staking.target);

    await mindToken.addMinter(staking.target);

    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy(deployer.address);
    await strategyManager.waitForDeployment();
    console.log("✓ Strategy Manager:", strategyManager.target);

    const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
    const vault = await NeuroWealthVault.deploy(
        staking.target,
        strategyManager.target,
        USDC_BASE_MAINNET
    );
    await vault.waitForDeployment();
    console.log("✓ Vault:", vault.target);

    await strategyManager.setVault(vault.target);

    const UniswapV3Adapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
    const uniswapAdapter = await UniswapV3Adapter.deploy(strategyManager.target);
    await uniswapAdapter.waitForDeployment();
    console.log("✓ Uniswap Adapter:", uniswapAdapter.target);

    await strategyManager.initializeUniswap(uniswapAdapter.target);
    console.log("✓ Deployment complete\n");

    // Get USDC from a whale
    console.log("=== Getting USDC from whale account ===");
    const USDC_WHALE = "0x20FE51A9229EEf2cF8Ad9E89d91CAb9312cF3b7A";
    await ethers.provider.send("hardhat_impersonateAccount", [USDC_WHALE]);
    const whale = await ethers.getSigner(USDC_WHALE);

    const usdc = await ethers.getContractAt("IERC20", USDC_BASE_MAINNET);
    const usdcAmount = ethers.parseUnits("10000", 6);
    await usdc.connect(whale).transfer(deployer.address, usdcAmount);
    console.log("✓ Received 10,000 USDC\n");

    // Check balances
    console.log("=== Initial Balances ===");
    console.log("USDC:", ethers.formatUnits(await usdc.balanceOf(deployer.address), 6));
    console.log("MIND:", ethers.formatEther(await mindToken.balanceOf(deployer.address)));

    // Stake MIND for Premium tier
    console.log("\n=== Staking MIND ===");
    const stakeAmount = ethers.parseEther("100");
    await mindToken.approve(staking.target, stakeAmount);
    await staking.stake(stakeAmount);
    const tier = await staking.getUserTier(deployer.address);
    console.log("✓ Staked 100 MIND");
    console.log("✓ Tier:", tier === 1n ? "Premium" : "Free");

    // Deposit USDC into vault
    console.log("\n=== Depositing to Vault ===");
    const depositAmount = ethers.parseUnits("1000", 6);
    await usdc.approve(vault.target, depositAmount);
    const tx = await vault.deposit(depositAmount);
    await tx.wait();
    console.log("✓ Deposited 1,000 USDC");

    // Check position
    const position = await vault.getUserPosition(deployer.address);
    console.log("\n=== Your Position ===");
    console.log("Principal:", ethers.formatUnits(position.principal, 6), "USDC");
    console.log("Current Value:", ethers.formatUnits(position.currentValue, 6), "USDC");

    // Check Uniswap position
    console.log("\n=== Checking Uniswap Position ===");
    const uniswapPosition = await uniswapAdapter.getUserPosition(deployer.address);
    console.log("Uniswap Token ID:", uniswapPosition.tokenId.toString());
    console.log("Liquidity:", uniswapPosition.liquidity.toString());
    console.log("Original USDC:", ethers.formatUnits(uniswapPosition.originalUSDC, 6));

    console.log("\n✅ Fork testing complete!");
    console.log("Your funds are now in a REAL Uniswap V3 position (on the fork)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });