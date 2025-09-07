import { ethers } from "hardhat";

async function simpleTest() {
  console.log("🧪 Simple Integration Test...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    
    // Get vault contract
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = YieldMindVault.attach(vaultAddress);
    
    console.log("✅ Vault contract attached");
    console.log(`Vault address: ${vault.target}`);
    
    // Check if deposit function exists
    console.log("\n🔍 Checking deposit function...");
    
    try {
      // Try to call deposit with minimal parameters
      const testAmount = ethers.parseEther("0.1");
      console.log(`Test amount: ${ethers.formatEther(testAmount)} STT`);
      
      // Check if we can estimate gas
      const gasEstimate = await vault.estimateGas.deposit(testAmount, { value: testAmount });
      console.log(`✅ Gas estimate successful: ${gasEstimate.toString()}`);
      
      // Try to execute the deposit
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
      console.log("❌ Deposit failed:", (error as Error).message);
      
      // Try to get more details about the error
      if (error instanceof Error) {
        console.log("Error details:", error.message);
        console.log("Error stack:", error.stack);
      }
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Main execution
if (require.main === module) {
  simpleTest()
    .then(() => {
      console.log("\n✅ Simple test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

export { simpleTest };
