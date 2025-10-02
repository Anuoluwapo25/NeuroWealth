// scripts/deployFork.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying to Hardhat forked Base mainnet...");
  const [deployer] = await ethers.getSigners();
  
  // Get some ETH (in fork mode, you can impersonate accounts)
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Base Mainnet USDC
  const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // 1. Deploy MIND token
  console.log("\n1. Deploying MIND token...");
  const MIND = await ethers.getContractFactory("MIND");
  const mindToken = await MIND.deploy();
  await mindToken.waitForDeployment();
  console.log("✓ MIND:", mindToken.target);

  // 2. Deploy MINDStaking
  console.log("\n2. Deploying MINDStaking...");
  const MINDStaking = await ethers.getContractFactory("MINDStaking");
  const staking = await MINDStaking.deploy(mindToken.target);
  await staking.waitForDeployment();
  console.log("✓ Staking:", staking.target);

  // 3. Setup minter
  await mindToken.addMinter(staking.target);
  console.log("✓ Minter setup complete");

  // 4. Deploy AIStrategyManagerV2
  console.log("\n3. Deploying AIStrategyManagerV2...");
  const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
  const strategyManager = await AIStrategyManagerV2.deploy(deployer.address);
  await strategyManager.waitForDeployment();
  console.log("✓ Strategy Manager:", strategyManager.target);

  // 5. Deploy NeuroWealthVault
  console.log("\n4. Deploying NeuroWealthVault...");
  const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
  const vault = await NeuroWealthVault.deploy(
    staking.target,
    strategyManager.target,
    USDC_BASE_MAINNET
  );
  await vault.waitForDeployment();
  console.log("✓ Vault:", vault.target);

  // 6. Update strategy manager
  await strategyManager.setVault(vault.target);
  console.log("✓ Vault address updated");

  // 7. Deploy UniswapV3StrategyAdapter
  console.log("\n5. Deploying UniswapV3StrategyAdapter...");
  const UniswapV3Adapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
  const uniswapAdapter = await UniswapV3Adapter.deploy(strategyManager.target);
  await uniswapAdapter.waitForDeployment();
  console.log("✓ Uniswap Adapter:", uniswapAdapter.target);

  // 8. Initialize Uniswap
  await strategyManager.initializeUniswap(uniswapAdapter.target);
  console.log("✓ Uniswap initialized");

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE - Forked Base Mainnet");
  console.log("=".repeat(60));
  
  return {
    mind: mindToken.target,
    staking: staking.target,
    strategyManager: strategyManager.target,
    vault: vault.target,
    uniswapAdapter: uniswapAdapter.target,
    usdc: USDC_BASE_MAINNET
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });