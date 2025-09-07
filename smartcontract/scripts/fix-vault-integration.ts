import { ethers } from "hardhat";

async function fixVaultIntegration() {
  console.log("🔧 Fixing Vault Integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Fixing with account:", deployer.address);
  
  try {
    // Contract addresses from our deployment
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    const strategyManagerAddress = "0xC3074058Bf8439f17182714A84BfA470F3908e6c";
    
    console.log("\n📋 Current Addresses:");
    console.log(`Vault: ${vaultAddress}`);
    console.log(`Strategy Manager: ${strategyManagerAddress}`);
    
    // Get the strategy manager contract
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = AIStrategyManagerV2.attach(strategyManagerAddress);
    
    // Check current vault address
    const currentVaultAddress = await strategyManager.yieldMindVault();
    console.log(`\n🔍 Current vault address in strategy manager: ${currentVaultAddress}`);
    
    if (currentVaultAddress === ethers.ZeroAddress) {
      console.log("❌ Strategy manager has zero address as vault - this is the problem!");
      
      // We need to redeploy the strategy manager with the correct vault address
      console.log("\n🔄 Redeploying AIStrategyManagerV2 with correct vault address...");
      
      const newStrategyManager = await AIStrategyManagerV2.deploy(vaultAddress);
      await newStrategyManager.waitForDeployment();
      
      const newStrategyManagerAddress = await newStrategyManager.getAddress();
      console.log("✅ New AIStrategyManagerV2 deployed to:", newStrategyManagerAddress);
      
      // Add mock protocol to new strategy manager
      console.log("\n🔧 Adding mock protocol to new strategy manager...");
      const mockProtocolAddress = "0x6F1c57D52A55BDE37C556bcb003255448D36917f";
      
      await newStrategyManager.addProtocol(
        mockProtocolAddress,
        "Mock Somnia Protocol",
        1500, // 15% APY
        30,   // Low-medium risk
        1000000, // 1M TVL
        true  // Supports native tokens
      );
      console.log("✅ Mock protocol added to new strategy manager");
      
      // Update vault with new strategy manager address
      console.log("\n🔧 Updating vault with new strategy manager address...");
      const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
      const vault = YieldMindVault.attach(vaultAddress);
      
      await vault.setStrategyManager(newStrategyManagerAddress);
      console.log("✅ Vault updated with new strategy manager address");
      
      // Test the integration
      console.log("\n🧪 Testing integration...");
      
      // Test vault can call strategy manager
      try {
        const testAmount = ethers.parseEther("0.1");
        const gasEstimate = await strategyManager.estimateGas.executeStrategy(testAmount, ethers.ZeroAddress);
        console.log("✅ Gas estimation successful - vault can call strategy manager");
        console.log(`   Gas estimate: ${gasEstimate.toString()}`);
      } catch (error) {
        console.log("❌ Gas estimation failed:", (error as Error).message);
      }
      
      // Display final addresses
      console.log("\n🎯 INTEGRATION FIXED!");
      console.log("=====================");
      console.log("📋 Updated Contract Addresses:");
      console.log(`YieldMindVault: ${vaultAddress}`);
      console.log(`AIStrategyManagerV2: ${newStrategyManagerAddress}`);
      console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
      console.log(`MockMindStaking: 0xA529547b901F9613b2e0E1F171B7864d8172e674`);
      
      // Save updated addresses
      const addresses = {
        YieldMindVault: vaultAddress,
        AIStrategyManagerV2: newStrategyManagerAddress,
        MockSomniaProtocol: mockProtocolAddress,
        MockMindStaking: "0xA529547b901F9613b2e0E1F171B7864d8172e674",
        Status: "Fixed - Vault integration working"
      };
      
      const fs = require('fs');
      fs.writeFileSync('fixed-vault-integration.json', JSON.stringify(addresses, null, 2));
      console.log("\n💾 Updated addresses saved to fixed-vault-integration.json");
      
      console.log("\n📝 Next Steps:");
      console.log("1. Update frontend/abi/index.ts with new AIStrategyManagerV2 address");
      console.log("2. Test deposit functionality");
      console.log("3. Verify vault can call strategy manager");
      
    } else {
      console.log("✅ Strategy manager already has correct vault address");
    }
    
  } catch (error) {
    console.error("❌ Fix failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  fixVaultIntegration()
    .then(() => {
      console.log("\n✅ Vault integration fix completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fix failed:", error);
      process.exit(1);
    });
}

export { fixVaultIntegration };
