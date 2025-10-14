// scripts/deploySimplified.js
const { ethers, network } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("\n" + "=".repeat(60));
    console.log("🚀 SIMPLIFIED NEUROWEALTH DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("Network:", network.name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("=".repeat(60) + "\n");

    // Get network-specific USDC address
    const chainId = Number((await ethers.provider.getNetwork()).chainId);
    let USDC_ADDRESS;

    if (chainId === 84532) {
        // Base Sepolia
        USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        console.log("📍 Deploying to Base Sepolia");
    } else if (chainId === 8453) {
        // Base Mainnet
        USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
        console.log("📍 Deploying to Base Mainnet");
    } else {
        throw new Error(`Unsupported network with chainId: ${chainId}`);
    }

    console.log("USDC Address:", USDC_ADDRESS, "\n");

    // 1. Deploy MockMINDStaking (for testing)
    console.log("1️⃣  Deploying MockMINDStaking...");
    const MockMINDStaking = await ethers.getContractFactory("MockMINDStaking");
    const staking = await MockMINDStaking.deploy();
    await staking.waitForDeployment();
    console.log("   ✅ MockMINDStaking deployed to:", staking.target);

    // 2. Deploy UniswapV3StrategyAdapter (AI Agent will have access)
    console.log("\n2️⃣  Deploying UniswapV3StrategyAdapter...");
    const UniswapV3Adapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
    const uniswapAdapter = await UniswapV3Adapter.deploy(deployer.address); // Temp address, will be updated
    await uniswapAdapter.waitForDeployment();
    console.log("   ✅ Uniswap adapter deployed to:", uniswapAdapter.target);

    // 3. Deploy SimplifiedNeuroWealthVault
    console.log("\n3️⃣  Deploying SimplifiedNeuroWealthVault...");
    const SimplifiedVault = await ethers.getContractFactory("SimplifiedNeuroWealthVault");
    const vault = await SimplifiedVault.deploy(
        staking.target,
        uniswapAdapter.target,
        USDC_ADDRESS
    );
    await vault.waitForDeployment();
    console.log("   ✅ Simplified vault deployed to:", vault.target);

    // 4. Grant AI Agent role to vault in Uniswap adapter
    console.log("\n4️⃣  Setting up AI Agent permissions...");
    const tx1 = await uniswapAdapter.setAIAgent(vault.target);
    await tx1.wait();
    console.log("   ✅ Vault granted AI Agent role in Uniswap adapter");

    // 5. Update Uniswap adapter's strategy manager to vault
    console.log("\n5️⃣  Updating Uniswap adapter configuration...");
    const tx2 = await uniswapAdapter.setAiStrategyManager(vault.target);
    await tx2.wait();
    console.log("   ✅ Uniswap adapter updated with vault address");

    // 6. Verify Uniswap adapter configuration
    console.log("\n6️⃣  Verifying Uniswap adapter configuration...");
    const config = await uniswapAdapter.config();
    console.log("   Network Config:");
    console.log("   - Chain ID:", config.chainId.toString());
    console.log("   - Position Manager:", config.positionManager);
    console.log("   - Swap Router:", config.swapRouter);
    console.log("   - Factory:", config.factory);
    console.log("   - USDC:", config.usdc);
    console.log("   - WETH:", config.weth);

    if (config.usdc.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
        console.warn("   ⚠️  WARNING: Adapter USDC address doesn't match!");
    } else {
        console.log("   ✅ Uniswap adapter configuration verified");
    }

    // 7. Final verification
    console.log("\n7️⃣  Running final verifications...");
    const vaultOwner = await vault.owner();
    const adapterOwner = await uniswapAdapter.owner();
    const hasRole = await uniswapAdapter.hasRole(
        await uniswapAdapter.AI_AGENT_ROLE(),
        vault.target
    );

    console.log("   - Vault owner:", vaultOwner);
    console.log("   - Adapter owner:", adapterOwner);
    console.log("   - Vault has AI Agent role:", hasRole);
    console.log("   - USDC address in vault:", await vault.USDC());
    console.log("   ✅ Ownership and permissions verified");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✨ SIMPLIFIED DEPLOYMENT COMPLETE ✨");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:\n");
    console.log("MockMINDStaking:      ", staking.target);
    console.log("SimplifiedVault:      ", vault.target);
    console.log("UniswapV3Adapter:     ", uniswapAdapter.target);

    console.log("\n🔗 Network Info:\n");
    console.log("Network:             ", network.name);
    console.log("Chain ID:            ", chainId);
    console.log("USDC Address:        ", USDC_ADDRESS);

    console.log("\n💾 Save to .env or deployment config:\n");
    console.log(`MOCK_MIND_STAKING_ADDRESS=${staking.target}`);
    console.log(`SIMPLIFIED_VAULT_ADDRESS=${vault.target}`);
    console.log(`UNISWAP_ADAPTER_ADDRESS=${uniswapAdapter.target}`);

    console.log("\n📝 Next Steps:\n");
    console.log("1. Verify contracts on BaseScan:");
    console.log("   npx hardhat verify --network baseSepolia", staking.target);
    console.log("   npx hardhat verify --network baseSepolia", vault.target, staking.target, uniswapAdapter.target, USDC_ADDRESS);
    console.log("   npx hardhat verify --network baseSepolia", uniswapAdapter.target, deployer.address);

    console.log("\n2. Test the simplified flow:");
    console.log("   - User deposits USDC to vault");
    console.log("   - Vault (as AI agent) routes to Uniswap adapter");
    console.log("   - Uniswap adapter creates NFT position for user");
    console.log("   - User can view APY and collect fees");

    console.log("\n3. Grant additional AI agent roles if needed:");
    console.log("   - Call setAIAgent() on vault and adapter contracts");
    console.log("   - Only SUPER_ADMIN (deployer) can grant/revoke roles");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Simplified architecture ready for testing!");
    console.log("=".repeat(60) + "\n");
}

main().catch((error) => {
    console.error("\n❌ Deployment failed:\n");
    console.error(error);
    process.exitCode = 1;
});
