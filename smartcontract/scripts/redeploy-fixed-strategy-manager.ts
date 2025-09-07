import { ethers } from "hardhat";

async function redeployFixedStrategyManager() {
  console.log("🔄 Redeploying Fixed AIStrategyManagerV2...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Redeploying with account:", deployer.address);
  
  try {
    // Contract addresses
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    const mockProtocolAddress = "0x6F1c57D52A55BDE37C556bcb003255448D36917f";
    
    console.log("\n📋 Current Addresses:");
    console.log(`Vault: ${vaultAddress}`);
    console.log(`Mock Protocol: ${mockProtocolAddress}`);
    
    // Deploy new AIStrategyManagerV2 with interface implementation
    console.log("\n📦 Deploying Fixed AIStrategyManagerV2...");
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy(vaultAddress);
    await strategyManager.waitForDeployment();
    
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ Fixed AIStrategyManagerV2 deployed to:", strategyManagerAddress);
    
    // Add mock protocol to strategy manager
    console.log("\n🔧 Adding mock protocol to strategy manager...");
    await strategyManager.addProtocol(
      mockProtocolAddress,
      "Mock Somnia Protocol",
      1500, // 15% APY
      30,   // Low-medium risk
      1000000, // 1M TVL
      true  // Supports native tokens
    );
    console.log("✅ Mock protocol added to strategy manager");
    
    // Update vault with new strategy manager address
    console.log("\n🔧 Updating vault with new strategy manager address...");
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = YieldMindVault.attach(vaultAddress);
    
    await vault.setStrategyManager(strategyManagerAddress);
    console.log("✅ Vault updated with new strategy manager address");
    
    // Test the integration
    console.log("\n🧪 Testing Fixed Integration...");
    
    // Test 1: Check vault can call strategy manager
    try {
      const testAmount = ethers.parseEther("0.1");
      const gasEstimate = await strategyManager.estimateGas.executeStrategy(testAmount, ethers.ZeroAddress);
      console.log("✅ Strategy manager executeStrategy gas estimate successful");
      console.log(`   Gas estimate: ${gasEstimate.toString()}`);
    } catch (error) {
      console.log("❌ Strategy manager executeStrategy failed:", (error as Error).message);
    }
    
    // Test 2: Test vault deposit
    try {
      const testAmount = ethers.parseEther("0.1");
      console.log("🔄 Testing vault deposit...");
      
      const depositTx = await vault.deposit(testAmount, { value: testAmount });
      console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
      
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
      console.log(`✅ Transaction status: ${receipt?.status}`);
      
      if (receipt?.status === 1) {
        console.log("🎉 DEPOSIT SUCCESSFUL! Integration is working!");
        
        // Check user position
        const userPosition = await vault.userPositions(deployer.address);
        console.log(`User principal: ${ethers.formatEther(userPosition.principal)} STT`);
        console.log(`User current value: ${ethers.formatEther(userPosition.currentValue)} STT`);
        
      } else {
        console.log("❌ Deposit transaction reverted");
      }
      
    } catch (error) {
      console.log("❌ Vault deposit test failed:", (error as Error).message);
    }
    
    // Display final addresses
    console.log("\n🎯 FIXED DEPLOYMENT COMPLETE!");
    console.log("=============================");
    console.log("📋 Updated Contract Addresses:");
    console.log(`YieldMindVault: ${vaultAddress}`);
    console.log(`AIStrategyManagerV2: ${strategyManagerAddress}`);
    console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
    console.log(`MockMindStaking: 0xA529547b901F9613b2e0E1F171B7864d8172e674`);
    
    // Save updated addresses
    const addresses = {
      YieldMindVault: vaultAddress,
      AIStrategyManagerV2: strategyManagerAddress,
      MockSomniaProtocol: mockProtocolAddress,
      MockMindStaking: "0xA529547b901F9613b2e0E1F171B7864d8172e674",
      Status: "Fixed - Interface implementation added"
    };
    
    const fs = require('fs');
    fs.writeFileSync('fixed-interface-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Updated addresses saved to fixed-interface-addresses.json");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend/abi/index.ts with new AIStrategyManagerV2 address");
    console.log("2. Test deposit functionality in frontend");
    console.log("3. Verify complete integration is working");
    
  } catch (error) {
    console.error("❌ Redeployment failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  redeployFixedStrategyManager()
    .then(() => {
      console.log("\n✅ Fixed strategy manager deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Redeployment failed:", error);
      process.exit(1);
    });
}

export { redeployFixedStrategyManager };
