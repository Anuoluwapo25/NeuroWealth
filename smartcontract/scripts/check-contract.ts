import { ethers } from "hardhat";

async function checkContract() {
  console.log("🔍 Checking Contract at Address...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Checking with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    
    // Check if contract exists at address
    const provider = deployer.provider;
    const code = await provider.getCode(vaultAddress);
    
    console.log(`\n🔍 Contract Code at ${vaultAddress}:`);
    if (code === "0x") {
      console.log("❌ No contract at this address");
    } else {
      console.log("✅ Contract exists at this address");
      console.log(`Code length: ${code.length} characters`);
    }
    
    // Try to get contract using getContractAt
    console.log("\n🔍 Trying getContractAt...");
    try {
      const vault = await ethers.getContractAt("YieldMindVault", vaultAddress);
      console.log("✅ Contract retrieved using getContractAt");
      console.log(`Contract address: ${vault.target}`);
      
      // Try to call a simple function
      const isPaused = await vault.paused();
      console.log(`✅ Vault paused: ${isPaused}`);
      
      // Try to call deposit function
      console.log("\n🔍 Testing deposit function...");
      const testAmount = ethers.parseEther("0.1");
      
      try {
        const gasEstimate = await vault.estimateGas.deposit(testAmount, { value: testAmount });
        console.log(`✅ Gas estimate successful: ${gasEstimate.toString()}`);
        
        // Try to execute deposit
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
        
      } catch (depositError) {
        console.log("❌ Deposit failed:", (depositError as Error).message);
      }
      
    } catch (error) {
      console.log("❌ getContractAt failed:", (error as Error).message);
    }
    
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

// Main execution
if (require.main === module) {
  checkContract()
    .then(() => {
      console.log("\n✅ Contract check completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Check failed:", error);
      process.exit(1);
    });
}

export { checkContract };
