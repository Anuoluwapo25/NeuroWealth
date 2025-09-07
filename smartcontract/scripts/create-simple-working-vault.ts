import { ethers } from "hardhat";

async function createSimpleWorkingVault() {
  console.log("🚀 Creating Simple Working Vault...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Creating with account:", deployer.address);
  
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
    
    // Deploy MockMindStaking
    console.log("\n📦 Deploying MockMindStaking...");
    const MockMindStaking = await ethers.getContractFactory("MockMindStaking");
    const mockMindStaking = await MockMindStaking.deploy();
    await mockMindStaking.waitForDeployment();
    
    const mockMindStakingAddress = await mockMindStaking.getAddress();
    console.log("✅ MockMindStaking deployed to:", mockMindStakingAddress);
    
    // Deploy a simplified vault that directly integrates with mock protocol
    console.log("\n📦 Deploying Simplified Vault...");
    const SimplifiedVault = await ethers.getContractFactory("SimplifiedVault");
    const vault = await SimplifiedVault.deploy(
      mockMindStakingAddress,
      mockProtocolAddress
    );
    await vault.waitForDeployment();
    
    const vaultAddress = await vault.getAddress();
    console.log("✅ SimplifiedVault deployed to:", vaultAddress);
    
    // Set up user tier
    console.log("\n🔧 Setting up user tier...");
    await mockMindStaking.setUserTier(deployer.address, 2); // Pro tier
    console.log("✅ User tier set to Pro (tier 2)");
    
    // Test the simplified vault
    console.log("\n🧪 Testing Simplified Vault...");
    
    const testAmount = ethers.parseEther("0.1");
    console.log(`Testing deposit with ${ethers.formatEther(testAmount)} STT...`);
    
    try {
      const depositTx = await vault.deposit({ value: testAmount });
      console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
      
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
      console.log(`✅ Transaction status: ${receipt?.status}`);
      
      if (receipt?.status === 1) {
        console.log("🎉 DEPOSIT SUCCESSFUL!");
        
        // Check user position
        const userPosition = await vault.userPositions(deployer.address);
        console.log(`User principal: ${ethers.formatEther(userPosition.principal)} STT`);
        console.log(`User current value: ${ethers.formatEther(userPosition.currentValue)} STT`);
        
        // Check mock protocol balance
        const protocolBalance = await mockProtocol.getBalance(vaultAddress);
        console.log(`Protocol balance: ${ethers.formatEther(protocolBalance)} STT`);
        
      } else {
        console.log("❌ Deposit transaction reverted");
      }
      
    } catch (error) {
      console.log("❌ Deposit test failed:", (error as Error).message);
    }
    
    // Display final addresses
    console.log("\n🎯 SIMPLIFIED VAULT DEPLOYMENT COMPLETE!");
    console.log("=========================================");
    console.log("📋 Contract Addresses:");
    console.log(`SimplifiedVault: ${vaultAddress}`);
    console.log(`MockSomniaProtocol: ${mockProtocolAddress}`);
    console.log(`MockMindStaking: ${mockMindStakingAddress}`);
    
    console.log("\n💰 Features:");
    console.log("✅ Direct deposit to mock protocol");
    console.log("✅ 15% APY rewards");
    console.log("✅ User tier management");
    console.log("✅ No complex strategy manager integration");
    
    // Save addresses
    const addresses = {
      SimplifiedVault: vaultAddress,
      MockSomniaProtocol: mockProtocolAddress,
      MockMindStaking: mockMindStakingAddress,
      Status: "Working - Simplified approach"
    };
    
    const fs = require('fs');
    fs.writeFileSync('simplified-vault-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to simplified-vault-addresses.json");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend with simplified vault address");
    console.log("2. Test deposit/withdrawal functionality");
    console.log("3. Add more features as needed");
    
  } catch (error) {
    console.error("❌ Simplified vault creation failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  createSimpleWorkingVault()
    .then(() => {
      console.log("\n✅ Simplified vault creation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Creation failed:", error);
      process.exit(1);
    });
}

export { createSimpleWorkingVault };
