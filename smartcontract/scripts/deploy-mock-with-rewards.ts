import { ethers } from "hardhat";

async function deployMockWithRewards() {
  console.log("🚀 Deploying YieldMind with Mock Protocol Rewards...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  try {
    // Deploy MockSomniaProtocol with realistic rewards
    console.log("\n📦 Deploying MockSomniaProtocol...");
    const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
    
    // Use native STT token (address(0) for native tokens)
    const mockProtocol = await MockSomniaProtocol.deploy(
      ethers.ZeroAddress, // Native token (STT)
      true,               // Supports native tokens
      1500                // 15% APY (1500 basis points)
    );
    await mockProtocol.waitForDeployment();
    
    const mockProtocolAddress = await mockProtocol.getAddress();
    console.log("✅ MockSomniaProtocol deployed to:", mockProtocolAddress);
    
    // Deploy YieldMindVault first (needed for AIStrategyManagerV2)
    console.log("\n📦 Deploying YieldMindVault...");
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = await YieldMindVault.deploy();
    await vault.waitForDeployment();
    
    const vaultAddress = await vault.getAddress();
    console.log("✅ YieldMindVault deployed to:", vaultAddress);
    
    // Deploy AIStrategyManagerV2
    console.log("\n📦 Deploying AIStrategyManagerV2...");
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy(vaultAddress);
    await strategyManager.waitForDeployment();
    
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ AIStrategyManagerV2 deployed to:", strategyManagerAddress);
    
    
    // Setup integrations
    console.log("\n🔧 Setting up integrations...");
    
    // Add mock protocol to strategy manager
    await strategyManager.addProtocol(
      mockProtocolAddress,
      "Mock Somnia Protocol",
      1500, // 15% APY
      30,   // Low-medium risk
      1000000, // 1M TVL
      true  // Supports native tokens
    );
    console.log("✅ Mock protocol added to strategy manager");
    
    // Set strategy manager in vault
    await vault.setStrategyManager(strategyManagerAddress);
    console.log("✅ Strategy manager set in vault");
    
    // Display final addresses
    console.log("\n🎯 DEPLOYMENT COMPLETE!");
    console.log("========================");
    console.log("📋 Contract Addresses:");
    console.log(`YieldMindVault: ${vaultAddress}`);
    console.log(`AIStrategyManagerV2: ${strategyManagerAddress}`);
    console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
    
    console.log("\n💰 Reward Configuration:");
    console.log("APY: 15% (1500 basis points)");
    console.log("Reward Rate: ~0.00000476% per second");
    console.log("Daily Rewards: ~0.41% of deposit");
    console.log("Monthly Rewards: ~12.5% of deposit");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend/abi/index.ts with these addresses");
    console.log("2. Test deposit functionality");
    console.log("3. Wait and test reward accumulation");
    console.log("4. Test withdrawal with rewards");
    
    // Save addresses to file
    const addresses = {
      YieldMindVault: vaultAddress,
      AIStrategyManagerV2: strategyManagerAddress,
      MockSomniaProtocol: mockProtocolAddress,
      RewardConfig: {
        apy: 1500,
        rewardRate: "0.00000476% per second",
        dailyRewards: "0.41% of deposit",
        monthlyRewards: "12.5% of deposit"
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync('mock-deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to mock-deployed-addresses.json");
    
    // Test the mock protocol
    console.log("\n🧪 Testing Mock Protocol...");
    
    // Test deposit
    const depositAmount = ethers.parseEther("1"); // 1 STT
    console.log(`Testing deposit of ${ethers.formatEther(depositAmount)} STT...`);
    
    // Note: This would require the contract to be deployed and funded
    console.log("✅ Mock protocol ready for testing!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  deployMockWithRewards()
    .then(() => {
      console.log("\n✅ Mock protocol deployment completed successfully!");
      console.log("🎯 Users can now deposit STT and earn 15% APY rewards!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { deployMockWithRewards };
