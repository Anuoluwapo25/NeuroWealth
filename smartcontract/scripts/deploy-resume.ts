import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Resuming YieldMind deployment on CrossFi chain...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "CFX");

  // Already deployed contract addresses
  const mindTokenAddress = "0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4";
  const mindStakingAddress = "0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4";
  
  console.log("📋 Using already deployed contracts:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);

  // Deploy AIStrategyManager
  console.log("\n3️⃣ Deploying AIStrategyManager...");
  const AIStrategyManager = await ethers.getContractFactory("AIStrategyManager");
  const aiStrategyManager = await AIStrategyManager.deploy("0x0000000000000000000000000000000000000000"); // Placeholder vault address
  await aiStrategyManager.waitForDeployment();
  const aiStrategyManagerAddress = await aiStrategyManager.getAddress();
  console.log("✅ AIStrategyManager deployed to:", aiStrategyManagerAddress);

  // Deploy YieldMindVault
  console.log("\n4️⃣ Deploying YieldMindVault...");
  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const yieldMindVault = await YieldMindVault.deploy(mindStakingAddress, aiStrategyManagerAddress);
  await yieldMindVault.waitForDeployment();
  const yieldMindVaultAddress = await yieldMindVault.getAddress();
  console.log("✅ YieldMindVault deployed to:", yieldMindVaultAddress);

  // Deploy FeeManager
  console.log("\n5️⃣ Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await FeeManager.deploy(
    mindTokenAddress,
    mindStakingAddress,
    deployer.address, // devTreasury
    "0x0000000000000000000000000000000000000000" // placeholder DEX router
  );
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log("✅ FeeManager deployed to:", feeManagerAddress);

  // Update AIStrategyManager with correct vault address
  console.log("\n6️⃣ Updating AIStrategyManager with vault address...");
  // Note: This would require a setter function in AIStrategyManager
  // For now, we'll redeploy with correct address
  const AIStrategyManagerUpdated = await ethers.getContractFactory("AIStrategyManager");
  const aiStrategyManagerUpdated = await AIStrategyManagerUpdated.deploy(yieldMindVaultAddress);
  await aiStrategyManagerUpdated.waitForDeployment();
  const aiStrategyManagerUpdatedAddress = await aiStrategyManagerUpdated.getAddress();
  console.log("✅ AIStrategyManager updated and deployed to:", aiStrategyManagerUpdatedAddress);

  // Setup initial permissions
  console.log("\n7️⃣ Setting up initial permissions...");
  
  // Get the MIND token contract instance
  const mindToken = await ethers.getContractAt("MIND", mindTokenAddress);
  
  // Add MINDStaking as minter for MIND token
  const addMinterTx = await mindToken.addMinter(mindStakingAddress);
  await addMinterTx.wait();
  console.log("✅ MINDStaking added as minter for MIND token");

  // Add FeeManager as minter for MIND token
  const addFeeManagerMinterTx = await mindToken.addMinter(feeManagerAddress);
  await addFeeManagerMinterTx.wait();
  console.log("✅ FeeManager added as minter for MIND token");

  // Add some sample protocols to AIStrategyManager
  console.log("\n8️⃣ Adding sample protocols to AIStrategyManager...");
  
  // Sample protocol addresses (replace with actual CrossFi protocol addresses)
  const sampleProtocols = [
    {
      address: "0x1234567890123456789012345678901234567890", // Replace with actual protocol
      name: "Sample Yield Protocol 1",
      apy: 1200, // 12% APY
      riskScore: 30,
      tvl: 1000000 * 1e18
    },
    {
      address: "0x2345678901234567890123456789012345678901", // Replace with actual protocol
      name: "Sample Yield Protocol 2", 
      apy: 800, // 8% APY
      riskScore: 20,
      tvl: 2000000 * 1e18
    }
  ];

  for (const protocol of sampleProtocols) {
    try {
      const addProtocolTx = await aiStrategyManagerUpdated.addProtocol(
        protocol.address,
        protocol.name,
        protocol.apy,
        protocol.riskScore,
        protocol.tvl
      );
      await addProtocolTx.wait();
      console.log(`✅ Added protocol: ${protocol.name}`);
    } catch (error) {
      console.log(`⚠️ Failed to add protocol ${protocol.name}:`, error);
    }
  }

  // Set distribution thresholds for FeeManager
  console.log("\n9️⃣ Setting up FeeManager thresholds...");
  const setThresholdTx = await feeManager.setDistributionThreshold(
    mindTokenAddress,
    1000 * 1e18 // 1000 MIND tokens threshold
  );
  await setThresholdTx.wait();
  console.log("✅ FeeManager distribution threshold set");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerUpdatedAddress);
  console.log("YieldMindVault:", yieldMindVaultAddress);
  console.log("FeeManager:", feeManagerAddress);
  console.log("\n🔗 Next steps:");
  console.log("1. Verify contracts on CrossFi explorer");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test contract interactions");
  console.log("4. Add real protocol addresses to AIStrategyManager");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 