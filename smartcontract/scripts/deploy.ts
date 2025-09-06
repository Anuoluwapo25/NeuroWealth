import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting YieldMind deployment on Somnia chain...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "SOM");

  // Deploy MIND token first
  console.log("\n1️⃣ Deploying MIND token...");
  const MIND = await ethers.getContractFactory("MIND");
  const mindToken = await MIND.deploy();
  await mindToken.waitForDeployment();
  const mindTokenAddress = await mindToken.getAddress();
  console.log("✅ MIND token deployed to:", mindTokenAddress);

  // Deploy MINDStaking contract
  console.log("\n2️⃣ Deploying MINDStaking contract...");
  const MINDStaking = await ethers.getContractFactory("MINDStaking");
  const mindStaking = await MINDStaking.deploy(mindTokenAddress);
  await mindStaking.waitForDeployment();
  const mindStakingAddress = await mindStaking.getAddress();
  console.log("✅ MINDStaking deployed to:", mindStakingAddress);

  // Deploy YieldMindVault first (with zero address for strategy manager)
  console.log("\n3️⃣ Deploying YieldMindVault...");
  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const yieldMindVault = await YieldMindVault.deploy(mindStakingAddress, "0x0000000000000000000000000000000000000000");
  await yieldMindVault.waitForDeployment();
  const yieldMindVaultAddress = await yieldMindVault.getAddress();
  console.log("✅ YieldMindVault deployed to:", yieldMindVaultAddress);

  // Deploy AIStrategyManager with vault address
  console.log("\n4️⃣ Deploying AIStrategyManager...");
  const AIStrategyManager = await ethers.getContractFactory("AIStrategyManager");
  const aiStrategyManager = await AIStrategyManager.deploy(yieldMindVaultAddress);
  await aiStrategyManager.waitForDeployment();
  const aiStrategyManagerAddress = await aiStrategyManager.getAddress();
  console.log("✅ AIStrategyManager deployed to:", aiStrategyManagerAddress);

  // Update vault with strategy manager address
  console.log("\n5️⃣ Updating vault with strategy manager address...");
  const setStrategyManagerTx = await yieldMindVault.setStrategyManager(aiStrategyManagerAddress);
  await setStrategyManagerTx.wait();
  console.log("✅ Vault updated with strategy manager address");

  // Setup initial permissions
  console.log("\n6️⃣ Setting up initial permissions...");
  
  // Add MINDStaking as minter for MIND token
  const addMinterTx = await mindToken.addMinter(mindStakingAddress);
  await addMinterTx.wait();
  console.log("✅ MINDStaking added as minter for MIND token");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerAddress);
  console.log("YieldMindVault:", yieldMindVaultAddress);
  console.log("\n🔗 Next steps:");
  console.log("1. Run: npm run setup:tokens");
  console.log("2. Run: npm run setup:protocols");
  console.log("3. Run: npm run verify:testnet");
  console.log("4. Update frontend with contract addresses");
  console.log("5. Test contract interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 