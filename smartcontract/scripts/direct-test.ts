import { ethers } from "hardhat";

async function directTest() {
  console.log("🧪 Direct Deposit Test...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    
    // Get contract
    const vault = await ethers.getContractAt("YieldMindVault", vaultAddress);
    console.log("✅ Contract retrieved");
    
    // Test deposit directly
    const testAmount = ethers.parseEther("0.1");
    console.log(`Test amount: ${ethers.formatEther(testAmount)} STT`);
    
    console.log("🔄 Attempting deposit...");
    const depositTx = await vault.deposit(testAmount, { value: testAmount });
    console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
    
    // Wait for confirmation
    const receipt = await depositTx.wait();
    console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
    console.log(`✅ Transaction status: ${receipt?.status}`);
    
    if (receipt?.status === 1) {
      console.log("🎉 DEPOSIT SUCCESSFUL!");
      
      // Check user position
      const userPosition = await vault.userPositions(deployer.address);
      console.log(`User principal: ${ethers.formatEther(userPosition.principal)} STT`);
      console.log(`User current value: ${ethers.formatEther(userPosition.currentValue)} STT`);
      
    } else {
      console.log("❌ Deposit transaction reverted");
    }
    
  } catch (error) {
    console.error("❌ Direct test failed:", error);
    
    // Try to get more details
    if (error instanceof Error) {
      console.log("Error message:", error.message);
      if (error.message.includes("Only vault can call")) {
        console.log("🔍 This suggests the strategy manager integration issue");
      }
    }
  }
}

// Main execution
if (require.main === module) {
  directTest()
    .then(() => {
      console.log("\n✅ Direct test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Direct test failed:", error);
      process.exit(1);
    });
}

export { directTest };
