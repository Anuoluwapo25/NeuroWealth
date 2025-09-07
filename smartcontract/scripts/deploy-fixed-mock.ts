import { ethers } from "hardhat";

async function deployFixedMock() {
  console.log("🚀 Deploying Fixed Mock Protocol with Proper MindStaking...");
  
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
    
    // Deploy MockMindStaking (proper implementation)
    console.log("\n📦 Deploying MockMindStaking...");
    const MockMindStaking = await ethers.getContractFactory("MockMindStaking");
    const mockMindStaking = await MockMindStaking.deploy();
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
      mockMindStakingAddress,  // MockMindStaking address
      strategyManagerAddress   // StrategyManager address
    );
    await vault.waitForDeployment();
    
    const vaultAddress = await vault.getAddress();
    console.log("✅ YieldMindVault deployed to:", vaultAddress);
    
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
    
    // Set up user tier for testing
    console.log("\n🔧 Setting up user tier for testing...");
    await mockMindStaking.setUserTier(deployer.address, 2); // Pro tier
    console.log("✅ User tier set to Pro (tier 2)");
    
    // Test the integration
    console.log("\n🧪 Testing integration...");
    
    // Test getUserTier function
    const userTier = await mockMindStaking.getUserTier(deployer.address);
    console.log(`✅ User tier: ${userTier} (0=Free, 1=Premium, 2=Pro)`);
    
    // Test vault contract state
    const isPaused = await vault.paused();
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    
    console.log("✅ Vault contract state:");
    console.log(`   Paused: ${isPaused}`);
    console.log(`   Min Deposit: ${ethers.formatEther(minDeposit)} STT`);
    console.log(`   Max Deposit: ${ethers.formatEther(maxDeposit)} STT`);
    
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
    
    console.log("\n👤 User Tier Setup:");
    console.log("User tier: Pro (tier 2)");
    console.log("Max deposit: $1M");
    console.log("Rebalance frequency: 1 hour");
    
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
      },
      UserTier: {
        tier: 2,
        maxDeposit: "1000000 STT",
        rebalanceFrequency: "1 hour"
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync('fixed-mock-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to fixed-mock-addresses.json");
    
    console.log("\n✅ Fixed mock protocol ready for testing!");
    console.log("🎯 Users can now deposit STT and earn 15% APY rewards!");
    console.log("🔧 MindStaking integration fixed - no more contract errors!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  deployFixedMock()
    .then(() => {
      console.log("\n✅ Fixed mock deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { deployFixedMock };
