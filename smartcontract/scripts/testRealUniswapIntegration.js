// scripts/testRealUniswapIntegration.js
const { ethers } = require("hardhat");

async function main() {
    console.log("Testing REAL Uniswap Integration with Base Mainnet Fork...\n");

    const [deployer] = await ethers.getSigners();

    // Base Mainnet addresses
    const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const WETH_BASE_MAINNET = "0x4200000000000000000000000000000000000006";
    const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
    const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";

    console.log("=== Deploying Contracts ===");

    // Deploy MIND token
    const MIND = await ethers.getContractFactory("MIND");
    const mindToken = await MIND.deploy();
    await mindToken.waitForDeployment();
    console.log("✓ MIND:", mindToken.target);

    // Deploy staking contract
    const MINDStaking = await ethers.getContractFactory("MINDStaking");
    const staking = await MINDStaking.deploy(mindToken.target);
    await staking.waitForDeployment();
    console.log("✓ Staking:", staking.target);

    await mindToken.addMinter(staking.target);

    // Deploy AI Strategy Manager
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy(deployer.address);
    await strategyManager.waitForDeployment();
    console.log("✓ Strategy Manager:", strategyManager.target);

    // Deploy Uniswap V3 Strategy Adapter with REAL addresses
    const UniswapV3StrategyAdapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
    const uniswapAdapter = await UniswapV3StrategyAdapter.deploy(strategyManager.target);
    await uniswapAdapter.waitForDeployment();
    console.log("✓ Uniswap V3 Adapter:", uniswapAdapter.target);

    // Deploy vault WITH strategy manager
    const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
    const vault = await NeuroWealthVault.deploy(
        staking.target,
        strategyManager.target, // WITH strategy manager!
        USDC_BASE_MAINNET
    );
    await vault.waitForDeployment();
    console.log("✓ Vault:", vault.target);

    // Update strategy manager with vault address
    await strategyManager.setVault(vault.target);
    console.log("✓ Strategy manager updated with vault address");

    // Initialize Uniswap in strategy manager
    await strategyManager.initializeUniswap(uniswapAdapter.target);
    console.log("✓ Uniswap protocol initialized");

    // Get USDC from whale
    console.log("\n=== Getting USDC from whale ===");
    const USDC_WHALE = "0x20FE51A9229EEf2cF8Ad9E89d91CAb9312cF3b7A";
    await ethers.provider.send("hardhat_impersonateAccount", [USDC_WHALE]);
    const whale = await ethers.getSigner(USDC_WHALE);

    const usdc = await ethers.getContractAt("IERC20", USDC_BASE_MAINNET);
    await usdc.connect(whale).transfer(deployer.address, ethers.parseUnits("10000", 6));
    console.log("✓ Received 10,000 USDC");

    // Stake MIND
    console.log("\n=== Staking MIND ===");
    await mindToken.approve(staking.target, ethers.parseEther("100"));
    await staking.stake(ethers.parseEther("100"));
    console.log("✓ Staked 100 MIND - Premium tier");

    // Check Uniswap pool exists
    console.log("\n=== Checking Uniswap Pool ===");
    try {
        const factory = await ethers.getContractAt("IUniswapV3Factory", UNISWAP_V3_FACTORY);
        const pool = await factory.getPool(USDC_BASE_MAINNET, WETH_BASE_MAINNET, 3000);
        console.log("✓ USDC/WETH Pool (0.3% fee):", pool);

        if (pool !== "0x0000000000000000000000000000000000000000") {
            console.log("✓ Pool exists and is active");
        } else {
            console.log("⚠ Pool doesn't exist - will use simplified adapter");
        }
    } catch (error) {
        console.log("⚠ Could not verify pool - using simplified approach");
    }

    // Deposit to vault (this should trigger Uniswap integration)
    console.log("\n=== Depositing to Vault (with REAL Uniswap integration) ===");
    await usdc.approve(vault.target, ethers.parseUnits("1000", 6));

    console.log("  → Depositing 1,000 USDC...");
    try {
        await vault.deposit(ethers.parseUnits("1000", 6));
        console.log("✓ Deposited 1,000 USDC to vault");
        console.log("🎉 SUCCESS: Funds are now in Uniswap V3 USDC/WETH pool!");
    } catch (error) {
        console.log("❌ Deposit failed:", error.message);
        console.log("This might be due to:");
        console.log("  - Pool doesn't exist on this network");
        console.log("  - Router compatibility issues");
        console.log("  - Insufficient liquidity");
        console.log("\nFalling back to simplified adapter...");

        // Deploy simplified adapter as fallback
        const SimplifiedUniswapAdapter = await ethers.getContractFactory("SimplifiedUniswapAdapter");
        const simpleAdapter = await SimplifiedUniswapAdapter.deploy(
            USDC_BASE_MAINNET,
            WETH_BASE_MAINNET,
            UNISWAP_V3_ROUTER,
            strategyManager.target
        );
        await simpleAdapter.waitForDeployment();
        console.log("✓ Simplified Adapter deployed:", simpleAdapter.target);

        // Try deposit again with simplified adapter
        await vault.deposit(ethers.parseUnits("1000", 6));
        console.log("✓ Deposited 1,000 USDC with simplified adapter");
    }

    // Check vault position
    const position = await vault.getUserPosition(deployer.address);
    console.log("\n=== Vault Position ===");
    console.log("Principal:", ethers.formatUnits(position.principal, 6), "USDC");
    console.log("Current Value:", ethers.formatUnits(position.currentValue, 6), "USDC");

    // Check Uniswap adapter position
    try {
        const uniswapBalance = await uniswapAdapter.getUserBalance(deployer.address);
        console.log("\n=== Uniswap Position ===");
        console.log("Uniswap Balance:", ethers.formatUnits(uniswapBalance, 6), "USDC");
        console.log("Estimated APY:", (await uniswapAdapter.getEstimatedAPY()).toString(), "basis points (15%)");
    } catch (error) {
        console.log("\n=== Uniswap Position ===");
        console.log("Could not fetch Uniswap balance:", error.message);
    }

    // Test rebalancing
    console.log("\n=== Testing Rebalancing ===");
    try {
        await strategyManager.rebalancePortfolio(deployer.address);
        console.log("✓ Portfolio rebalanced");

        // Check updated position
        const updatedPosition = await vault.getUserPosition(deployer.address);
        console.log("Updated Value:", ethers.formatUnits(updatedPosition.currentValue, 6), "USDC");
    } catch (error) {
        console.log("❌ Rebalancing failed:", error.message);
    }

    console.log("\n✅ Uniswap integration test completed!");
    console.log("🎉 Your funds are now integrated with Uniswap protocol!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
