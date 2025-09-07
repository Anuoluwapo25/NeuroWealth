import { ethers } from "hardhat";

// Real Somnia protocol addresses (these would be discovered from Somnia explorer)
// For now, we'll use realistic placeholder addresses that can be updated
const REAL_SOMNIA_PROTOCOLS = {
  // QuickSwap DEX on Somnia testnet (placeholder - needs real address)
  quickswapRouter: "0x0000000000000000000000000000000000000000", // Update with real QuickSwap router
  quickswapFactory: "0x0000000000000000000000000000000000000000", // Update with real QuickSwap factory
  
  // DIA Oracle on Somnia testnet (placeholder - needs real address)  
  diaOracle: "0x0000000000000000000000000000000000000000", // Update with real DIA oracle
  
  // Haifu.fun AI trading (placeholder - needs real address)
  haifuProtocol: "0x0000000000000000000000000000000000000000", // Update with real Haifu address
};

async function deployWithRealProtocols() {
  console.log("🚀 Deploying YieldMind with Real Somnia Protocol Integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // Check if we have real protocol addresses
  const hasRealProtocols = Object.values(REAL_SOMNIA_PROTOCOLS).some(addr => addr !== "0x0000000000000000000000000000000000000000");
  
  if (!hasRealProtocols) {
    console.log("⚠️  No real protocol addresses found yet");
    console.log("💡 Deploying with professional mock protocols for now");
    console.log("📋 To integrate real protocols:");
    console.log("   1. Visit Somnia testnet explorer");
    console.log("   2. Find QuickSwap, DIA Oracle, Haifu.fun contract addresses");
    console.log("   3. Update REAL_SOMNIA_PROTOCOLS in this script");
    console.log("   4. Redeploy with real addresses");
  }
  
  try {
    // Deploy SomniaProtocolIntegration with real protocol support
    console.log("\n📦 Deploying SomniaProtocolIntegration...");
    const SomniaProtocolIntegration = await ethers.getContractFactory("SomniaProtocolIntegration");
    const somniaIntegration = await SomniaProtocolIntegration.deploy();
    await somniaIntegration.waitForDeployment();
    
    const somniaIntegrationAddress = await somniaIntegration.getAddress();
    console.log("✅ SomniaProtocolIntegration deployed to:", somniaIntegrationAddress);
    
    // Deploy MockSomniaProtocol as fallback
    console.log("\n📦 Deploying MockSomniaProtocol (fallback)...");
    const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
    const mockProtocol = await MockSomniaProtocol.deploy();
    await mockProtocol.waitForDeployment();
    
    const mockProtocolAddress = await mockProtocol.getAddress();
    console.log("✅ MockSomniaProtocol deployed to:", mockProtocolAddress);
    
    // Deploy AIStrategyManagerV2
    console.log("\n📦 Deploying AIStrategyManagerV2...");
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy();
    await strategyManager.waitForDeployment();
    
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ AIStrategyManagerV2 deployed to:", strategyManagerAddress);
    
    // Deploy YieldMindVault
    console.log("\n📦 Deploying YieldMindVault...");
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = await YieldMindVault.deploy();
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
    
    // If we have real protocols, add them too
    if (hasRealProtocols) {
      console.log("🔗 Adding real Somnia protocols...");
      
      // Add QuickSwap
      if (REAL_SOMNIA_PROTOCOLS.quickswapRouter !== "0x0000000000000000000000000000000000000000") {
        await strategyManager.addProtocol(
          REAL_SOMNIA_PROTOCOLS.quickswapRouter,
          "QuickSwap DEX",
          1800, // 18% APY
          40,   // Medium risk
          5000000, // 5M TVL
          false // ERC20 only
        );
        console.log("✅ QuickSwap added to strategy manager");
      }
      
      // Add DIA Oracle
      if (REAL_SOMNIA_PROTOCOLS.diaOracle !== "0x0000000000000000000000000000000000000000") {
        await strategyManager.addProtocol(
          REAL_SOMNIA_PROTOCOLS.diaOracle,
          "DIA Oracle",
          0,    // Oracles don't generate yield
          10,   // Very low risk
          100000, // 100K TVL
          true  // Supports native tokens
        );
        console.log("✅ DIA Oracle added to strategy manager");
      }
      
      // Add Haifu.fun
      if (REAL_SOMNIA_PROTOCOLS.haifuProtocol !== "0x0000000000000000000000000000000000000000") {
        await strategyManager.addProtocol(
          REAL_SOMNIA_PROTOCOLS.haifuProtocol,
          "Haifu.fun AI",
          2500, // 25% APY
          60,   // Medium-high risk
          2000000, // 2M TVL
          true  // Supports native tokens
        );
        console.log("✅ Haifu.fun AI added to strategy manager");
      }
    }
    
    // Set strategy manager in vault
    await vault.setStrategyManager(strategyManagerAddress);
    console.log("✅ Strategy manager set in vault");
    
    // Display final addresses
    console.log("\n🎯 DEPLOYMENT COMPLETE!");
    console.log("========================");
    console.log("📋 Contract Addresses:");
    console.log(`YieldMindVault: ${vaultAddress}`);
    console.log(`AIStrategyManagerV2: ${strategyManagerAddress}`);
    console.log(`SomniaProtocolIntegration: ${somniaIntegrationAddress}`);
    console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend/abi/index.ts with these addresses");
    console.log("2. Test deposit/withdrawal functionality");
    console.log("3. Find real Somnia protocol addresses and redeploy");
    
    // Save addresses to file
    const addresses = {
      YieldMindVault: vaultAddress,
      AIStrategyManagerV2: strategyManagerAddress,
      SomniaProtocolIntegration: somniaIntegrationAddress,
      MockSomniaProtocol: mockProtocolAddress,
      RealProtocols: REAL_SOMNIA_PROTOCOLS
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to deployed-addresses.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  deployWithRealProtocols()
    .then(() => {
      console.log("\n✅ Deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { deployWithRealProtocols };
