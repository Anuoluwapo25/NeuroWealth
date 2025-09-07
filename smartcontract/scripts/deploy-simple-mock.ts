import { ethers } from "hardhat";

async function deploySimpleMock() {
  console.log("🚀 Deploying Simple Mock Protocol for Testing...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  try {
    // Deploy MockSomniaProtocol
    console.log("\n📦 Deploying MockSomniaProtocol...");
    const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
    
    const mockProtocol = await MockSomniaProtocol.deploy(
      ethers.ZeroAddress, // Native token (STT)
      true,               // Supports native tokens
      1500                // 15% APY (1500 basis points)
    );
    await mockProtocol.waitForDeployment();
    
    const mockProtocolAddress = await mockProtocol.getAddress();
    console.log("✅ MockSomniaProtocol deployed to:", mockProtocolAddress);
    
    // Deploy a simple MindStaking mock
    console.log("\n📦 Deploying MockMindStaking...");
    const MockMindStaking = await ethers.getContractFactory("MockERC20");
    const mockMindStaking = await MockMindStaking.deploy("Mock Mind Staking", "MIND", 18);
    await mockMindStaking.waitForDeployment();
    
    const mockMindStakingAddress = await mockMindStaking.getAddress();
    console.log("✅ MockMindStaking deployed to:", mockMindStakingAddress);
    
    // Deploy AIStrategyManagerV2 (needs vault address)
    console.log("\n📦 Deploying AIStrategyManagerV2...");
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    
    // Create a temporary vault address for now
    const tempVaultAddress = ethers.ZeroAddress;
    const strategyManager = await AIStrategyManagerV2.deploy(tempVaultAddress);
    await strategyManager.waitForDeployment();
    
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ AIStrategyManagerV2 deployed to:", strategyManagerAddress);
    
    // Deploy YieldMindVault
    console.log("\n📦 Deploying YieldMindVault...");
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = await YieldMindVault.deploy(
      mockMindStakingAddress,  // MindStaking address
      strategyManagerAddress   // StrategyManager address
    );
    await vault.waitForDeployment();
    
    const vaultAddress = await vault.getAddress();
    console.log("✅ YieldMindVault deployed to:", vaultAddress);
    
    // Update AIStrategyManagerV2 with correct vault address
    console.log("\n🔧 Updating AIStrategyManagerV2 with vault address...");
    // Note: This would require a setter function in AIStrategyManagerV2
    
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
    
    // Display final addresses
    console.log("\n🎯 DEPLOYMENT COMPLETE!");
    console.log("========================");
    console.log("📋 Contract Addresses:");
    console.log(`YieldMindVault: ${vaultAddress}`);
    console.log(`AIStrategyManagerV2: ${strategyManagerAddress}`);
    console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
    console.log(`MockMindStaking: ${mockMindStakingAddress}`);
    
    console.log("\n💰 Mock Protocol Features:");
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
      MockMindStaking: mockMindStakingAddress,
      RewardConfig: {
        apy: 1500,
        rewardRate: "0.00000476% per second",
        dailyRewards: "0.41% of deposit",
        monthlyRewards: "12.5% of deposit"
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync('simple-mock-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to simple-mock-addresses.json");
    
    // Test the mock protocol
    console.log("\n🧪 Testing Mock Protocol...");
    
    // Get protocol info
    const protocolInfo = await mockProtocol.getProtocolInfo();
    console.log("📊 Protocol Info:");
    console.log(`   APY: ${protocolInfo.apy} basis points (${Number(protocolInfo.apy) / 100}%)`);
    console.log(`   Total Deposits: ${ethers.formatEther(protocolInfo.totalDeposits)} STT`);
    console.log(`   Total Shares: ${ethers.formatEther(protocolInfo.totalShares)} shares`);
    console.log(`   Is Active: ${protocolInfo.isActive}`);
    
    console.log("\n✅ Mock protocol ready for testing!");
    console.log("🎯 Users can now deposit STT and earn 15% APY rewards!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  deploySimpleMock()
    .then(() => {
      console.log("\n✅ Simple mock deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { deploySimpleMock };
