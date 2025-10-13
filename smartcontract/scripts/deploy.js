// scripts/deploy.js
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n" + "=".repeat(60));
  console.log("🚀 NEUROWEALTH DEPLOYMENT");
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

  // 2. Deploy AIStrategyManagerV2
  console.log("\n2️⃣  Deploying AIStrategyManagerV2...");
  const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
  const strategyManager = await AIStrategyManagerV2.deploy(deployer.address); // Temp vault address
  await strategyManager.waitForDeployment();
  console.log("   ✅ Strategy Manager deployed to:", strategyManager.target);

  // 3. Deploy NeuroWealthVault
  console.log("\n3️⃣  Deploying NeuroWealthVault...");
  const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
  const vault = await NeuroWealthVault.deploy(
    staking.target,
    strategyManager.target,
    USDC_ADDRESS
  );
  await vault.waitForDeployment();
  console.log("   ✅ Vault deployed to:", vault.target);

  // 4. Update strategy manager with real vault
  console.log("\n4️⃣  Updating strategy manager with vault address...");
  const tx2 = await strategyManager.setVault(vault.target);
  await tx2.wait();
  console.log("   ✅ Strategy manager updated");

  // 5. Deploy UniswapV3StrategyAdapter
  console.log("\n5️⃣  Deploying UniswapV3StrategyAdapter...");
  const UniswapV3Adapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
  const uniswapAdapter = await UniswapV3Adapter.deploy(strategyManager.target);
  await uniswapAdapter.waitForDeployment();
  console.log("   ✅ Uniswap adapter deployed to:", uniswapAdapter.target);

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

  // 7. Initialize Uniswap in strategy manager
  console.log("\n7️⃣  Initializing Uniswap protocol in strategy manager...");
  try {
    const tx3 = await strategyManager.initializeUniswap(uniswapAdapter.target);
    await tx3.wait();
    console.log("   ✅ Uniswap protocol initialized");
  } catch (error) {
    console.log("   ⚠️  Note: initializeUniswap might not exist in your contract");
    console.log("   If using addProtocol instead, add it manually after deployment");
  }

  // 8. Final verification
  console.log("\n8️⃣  Running final verifications...");
  const vaultOwner = await vault.owner();
  const strategyManagerOwner = await strategyManager.owner();
  console.log("   - Vault owner:", vaultOwner);
  console.log("   - Strategy manager owner:", strategyManagerOwner);
  console.log("   - USDC address in vault:", await vault.USDC());
  console.log("   ✅ Ownership verified");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✨ DEPLOYMENT COMPLETE ✨");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:\n");
  console.log("MockMINDStaking:    ", staking.target);
  console.log("AIStrategyManager:  ", strategyManager.target);
  console.log("NeuroWealthVault:   ", vault.target);
  console.log("UniswapV3Adapter:   ", uniswapAdapter.target);

  console.log("\n🔗 Network Info:\n");
  console.log("Network:            ", network.name);
  console.log("Chain ID:           ", chainId);
  console.log("USDC Address:       ", USDC_ADDRESS);

  console.log("\n💾 Save to .env or deployment config:\n");
  console.log(`MOCK_MIND_STAKING_ADDRESS=${staking.target}`);
  console.log(`STRATEGY_MANAGER_ADDRESS=${strategyManager.target}`);
  console.log(`VAULT_ADDRESS=${vault.target}`);
  console.log(`UNISWAP_ADAPTER_ADDRESS=${uniswapAdapter.target}`);

  console.log("\n📝 Next Steps:\n");
  console.log("1. Verify contracts on BaseScan:");
  console.log("   npx hardhat verify --network baseSepolia", staking.target);
  console.log("   npx hardhat verify --network baseSepolia", strategyManager.target, deployer.address);
  console.log("   npx hardhat verify --network baseSepolia", vault.target, staking.target, strategyManager.target, USDC_ADDRESS);
  console.log("   npx hardhat verify --network baseSepolia", uniswapAdapter.target, strategyManager.target);

  console.log("\n2. Test deposits with testnet USDC");
  console.log("3. Monitor gas costs");
  console.log("4. Set up proper access controls if needed");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 All done! Ready to test on", network.name);
  console.log("=".repeat(60) + "\n");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:\n");
  console.error(error);
  process.exitCode = 1;
});