import { ethers } from "hardhat";

async function debugDepositIssue() {
  console.log("🔍 Debugging Deposit Issue...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0x5E19885955D4062369479998753C29874f1E66c6";
    const vault = await ethers.getContractAt("SimplifiedVault", vaultAddress);
    
    console.log("\n📋 Vault Info:");
    console.log(`Address: ${vaultAddress}`);
    
    // Check vault state
    const isPaused = await vault.paused();
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    
    console.log(`Paused: ${isPaused}`);
    console.log(`Min deposit: ${ethers.formatEther(minDeposit)} STT`);
    console.log(`Max deposit: ${ethers.formatEther(maxDeposit)} STT`);
    
    // Check user position before
    const userPositionBefore = await vault.userPositions(deployer.address);
    console.log(`User position before:`, {
      principal: ethers.formatEther(userPositionBefore.principal),
      currentValue: ethers.formatEther(userPositionBefore.currentValue),
      totalReturns: ethers.formatEther(userPositionBefore.totalReturns)
    });
    
    // Check MindStaking
    const mindStakingAddress = await vault.mindStaking();
    console.log(`MindStaking address: ${mindStakingAddress}`);
    
    try {
      const mindStaking = await ethers.getContractAt("MockMindStaking", mindStakingAddress);
      const userTier = await mindStaking.getUserTier(deployer.address);
      console.log(`User tier: ${userTier}`);
    } catch (error) {
      console.log("❌ MindStaking check failed:", (error as Error).message);
    }
    
    // Check MockProtocol
    const mockProtocolAddress = await vault.mockProtocol();
    console.log(`MockProtocol address: ${mockProtocolAddress}`);
    
    try {
      const mockProtocol = await ethers.getContractAt("MockSomniaProtocol", mockProtocolAddress);
      const apy = await mockProtocol.getAPY();
      const supportsNative = await mockProtocol.supportsNativeToken();
      console.log(`MockProtocol APY: ${apy.toString()}%`);
      console.log(`Supports native: ${supportsNative}`);
    } catch (error) {
      console.log("❌ MockProtocol check failed:", (error as Error).message);
    }
    
    // Try deposit with different amounts
    const testAmounts = [
      ethers.parseEther("0.1"), // Exactly min deposit
      ethers.parseEther("0.05"), // Below min deposit
      ethers.parseEther("0.2")  // Above min deposit
    ];
    
    for (const amount of testAmounts) {
      console.log(`\n🔍 Testing deposit with ${ethers.formatEther(amount)} STT...`);
      
      try {
        // Try deposit directly
        const depositTx = await vault.deposit({ value: amount });
        console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
        
        const receipt = await depositTx.wait();
        console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
        console.log(`✅ Transaction status: ${receipt?.status}`);
        
        if (receipt?.status === 1) {
          console.log("🎉 DEPOSIT SUCCESSFUL!");
          
          // Check updated user position
          const userPositionAfter = await vault.userPositions(deployer.address);
          console.log(`User position after:`, {
            principal: ethers.formatEther(userPositionAfter.principal),
            currentValue: ethers.formatEther(userPositionAfter.currentValue),
            totalReturns: ethers.formatEther(userPositionAfter.totalReturns)
          });
          
          break; // Stop after first successful deposit
        } else {
          console.log("❌ Deposit transaction reverted");
        }
        
      } catch (error) {
        console.log("❌ Deposit failed:", (error as Error).message);
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Main execution
if (require.main === module) {
  debugDepositIssue()
    .then(() => {
      console.log("\n✅ Deposit debug completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Debug failed:", error);
      process.exit(1);
    });
}

export { debugDepositIssue };
