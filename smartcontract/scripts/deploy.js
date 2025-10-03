// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. Deploy MIND token
  console.log("\n1. Deploying MIND token...");
  const MIND = await ethers.getContractFactory("MIND");
  const mindToken = await MIND.deploy();
  await mindToken.waitForDeployment();
  console.log("✓ MIND deployed to:", mindToken.target);

  // 2. Deploy MINDStaking
  console.log("\n2. Deploying MINDStaking...");
  const MINDStaking = await ethers.getContractFactory("MINDStaking");
  const staking = await MINDStaking.deploy(mindToken.target);
  await staking.waitForDeployment();
  console.log("✓ Staking deployed to:", staking.target);

  // 3. Add staking contract as MIND minter
  console.log("\n3. Setting up MIND minter...");
  await mindToken.addMinter(staking.target);
  console.log("✓ Staking contract added as MIND minter");

  // 4. Deploy AIStrategyManagerV2 with temp vault
  console.log("\n4. Deploying AIStrategyManagerV2...");
  const tempVault = deployer.address; // Temporary, will update later
  const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
  const strategyManager = await AIStrategyManagerV2.deploy(tempVault);
  await strategyManager.waitForDeployment();
  console.log("✓ Strategy Manager deployed to:", strategyManager.target);

  // 5. Deploy NeuroWealthVault
  console.log("\n5. Deploying NeuroWealthVault...");
  const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
  const vault = await NeuroWealthVault.deploy(
    staking.target,
    strategyManager.target,
    USDC_BASE_SEPOLIA
  );
  await vault.waitForDeployment();
  console.log("✓ Vault deployed to:", vault.target);

  // 6. Update strategy manager to use real vault
  console.log("\n6. Updating strategy manager with vault address...");
  await strategyManager.setVault(vault.target);
  console.log("✓ Strategy manager updated");

  // 7. Deploy UniswapV3StrategyAdapter
  console.log("\n7. Deploying UniswapV3StrategyAdapter...");
  const UniswapV3Adapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
  const uniswapAdapter = await UniswapV3Adapter.deploy(strategyManager.target);
  await uniswapAdapter.waitForDeployment();
  console.log("✓ Uniswap adapter deployed to:", uniswapAdapter.target);

  // 8. Initialize Uniswap in strategy manager
  console.log("\n8. Initializing Uniswap protocol...");
  await strategyManager.initializeUniswap(uniswapAdapter.target);
  console.log("✓ Uniswap protocol initialized");

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("\nContract Addresses:");
  console.log("MIND Token:", mindToken.target);
  console.log("Staking:", staking.target);
  console.log("Strategy Manager:", strategyManager.target);
  console.log("Vault:", vault.target);
  console.log("Uniswap Adapter:", uniswapAdapter.target);
  console.log("\nSave these addresses for verification and interaction!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});