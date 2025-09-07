import { ethers } from "hardhat";

async function debugContract() {
  console.log("🔍 Debugging Contract Functions...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Debugging with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    
    // Get contract
    const vault = await ethers.getContractAt("YieldMindVault", vaultAddress);
    console.log("✅ Contract retrieved");
    
    // List all available functions
    console.log("\n🔍 Available functions:");
    const functions = vault.interface.functions;
    Object.keys(functions).forEach(funcName => {
      console.log(`  - ${funcName}`);
    });
    
    // Check if deposit function exists
    console.log("\n🔍 Checking deposit function specifically:");
    if (vault.deposit) {
      console.log("✅ deposit function exists");
      console.log("Function signature:", vault.interface.getFunction("deposit").format());
    } else {
      console.log("❌ deposit function not found");
    }
    
    // Try to call deposit with different approaches
    console.log("\n🔍 Trying different deposit approaches:");
    
    const testAmount = ethers.parseEther("0.1");
    
    // Approach 1: Direct call
    try {
      console.log("Trying direct call...");
      const tx1 = await vault.deposit(testAmount, { value: testAmount });
      console.log("✅ Direct call successful:", tx1.hash);
    } catch (error) {
      console.log("❌ Direct call failed:", (error as Error).message);
    }
    
    // Approach 2: Using populateTransaction
    try {
      console.log("Trying populateTransaction...");
      const txData = await vault.deposit.populateTransaction(testAmount, { value: testAmount });
      console.log("✅ populateTransaction successful");
      console.log("Transaction data:", txData);
    } catch (error) {
      console.log("❌ populateTransaction failed:", (error as Error).message);
    }
    
    // Approach 3: Using estimateGas
    try {
      console.log("Trying estimateGas...");
      const gasEstimate = await vault.deposit.estimateGas(testAmount, { value: testAmount });
      console.log("✅ estimateGas successful:", gasEstimate.toString());
    } catch (error) {
      console.log("❌ estimateGas failed:", (error as Error).message);
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Main execution
if (require.main === module) {
  debugContract()
    .then(() => {
      console.log("\n✅ Debug completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Debug failed:", error);
      process.exit(1);
    });
}

export { debugContract };
