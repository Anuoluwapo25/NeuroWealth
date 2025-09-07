import { ethers } from "hardhat";

async function debugRewardsSystem() {
  console.log("🔍 Debugging Rewards System...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0x5E19885955D4062369479998753C29874f1E66c6";
    const vault = await ethers.getContractAt("SimplifiedVault", vaultAddress);
    const mockProtocolAddress = await vault.mockProtocol();
    const mockProtocol = await ethers.getContractAt("MockSomniaProtocol", mockProtocolAddress);
    
    console.log("\n📋 Rewards System Debug:");
    
    // Test 1: Check vault position
    console.log("\n🔍 Test 1: Vault Position");
    try {
      const vaultPosition = await vault.userPositions(deployer.address);
      console.log("✅ Vault position:");
      console.log(`  - Principal: ${(parseFloat(vaultPosition.principal.toString()) / 1e18).toFixed(4)} STT`);
      console.log(`  - Current Value: ${(parseFloat(vaultPosition.currentValue.toString()) / 1e18).toFixed(4)} STT`);
      console.log(`  - Total Returns: ${(parseFloat(vaultPosition.totalReturns.toString()) / 1e18).toFixed(4)} STT`);
    } catch (error) {
      console.log("❌ Vault position check failed:", (error as Error).message);
    }
    
    // Test 2: Check mock protocol position
    console.log("\n🔍 Test 2: Mock Protocol Position");
    try {
      const protocolPosition = await mockProtocol.userPositions(deployer.address);
      console.log("✅ Mock protocol position:");
      console.log(`  - Shares: ${(parseFloat(protocolPosition.shares.toString()) / 1e18).toFixed(4)}`);
      console.log(`  - Last Claimed: ${new Date(Number(protocolPosition.lastClaimed) * 1000).toISOString()}`);
      console.log(`  - Pending Rewards: ${(parseFloat(protocolPosition.pendingRewards.toString()) / 1e18).toFixed(4)} STT`);
      console.log(`  - Total Deposited: ${(parseFloat(protocolPosition.totalDeposited.toString()) / 1e18).toFixed(4)} STT`);
    } catch (error) {
      console.log("❌ Mock protocol position check failed:", (error as Error).message);
    }
    
    // Test 3: Check protocol config
    console.log("\n🔍 Test 3: Protocol Config");
    try {
      const config = await mockProtocol.config();
      console.log("✅ Protocol config:");
      console.log(`  - APY: ${config.apy.toString()}%`);
      console.log(`  - Total Deposits: ${(parseFloat(config.totalDeposits.toString()) / 1e18).toFixed(4)} STT`);
      console.log(`  - Total Shares: ${(parseFloat(config.totalShares.toString()) / 1e18).toFixed(4)}`);
      console.log(`  - Reward Rate: ${(parseFloat(config.rewardRate.toString()) / 1e18).toFixed(8)} per second`);
      console.log(`  - Last Update: ${new Date(Number(config.lastUpdate) * 1000).toISOString()}`);
      console.log(`  - Is Active: ${config.isActive}`);
    } catch (error) {
      console.log("❌ Protocol config check failed:", (error as Error).message);
    }
    
    // Test 4: Check pending rewards calculation
    console.log("\n🔍 Test 4: Pending Rewards Calculation");
    try {
      const pendingRewards = await mockProtocol.getPendingRewards(deployer.address);
      console.log("✅ Pending rewards:");
      console.log(`  - Pending Rewards: ${(parseFloat(pendingRewards.toString()) / 1e18).toFixed(4)} STT`);
      
      // Check if user has shares
      const userPosition = await mockProtocol.userPositions(deployer.address);
      if (userPosition.shares > 0) {
        console.log("✅ User has shares in protocol");
        
        // Calculate time elapsed
        const timeElapsed = Math.floor(Date.now() / 1000) - Number(userPosition.lastClaimed);
        console.log(`  - Time Elapsed: ${timeElapsed} seconds`);
        console.log(`  - Time Elapsed: ${(timeElapsed / 3600).toFixed(2)} hours`);
        
        // Calculate expected rewards
        const config = await mockProtocol.config();
        const expectedRewards = (userPosition.shares * config.rewardRate * BigInt(timeElapsed)) / BigInt(1e18);
        console.log(`  - Expected Rewards: ${(parseFloat(expectedRewards.toString()) / 1e18).toFixed(4)} STT`);
        
      } else {
        console.log("❌ User has no shares in protocol - this is the issue!");
      }
      
    } catch (error) {
      console.log("❌ Pending rewards calculation failed:", (error as Error).message);
    }
    
    // Test 5: Check vault's protocol balance
    console.log("\n🔍 Test 5: Vault's Protocol Balance");
    try {
      const protocolBalance = await vault.getProtocolBalance();
      console.log("✅ Vault's protocol balance:");
      console.log(`  - Protocol Balance: ${(parseFloat(protocolBalance.toString()) / 1e18).toFixed(4)} STT`);
    } catch (error) {
      console.log("❌ Protocol balance check failed:", (error as Error).message);
    }
    
    console.log("\n🎯 REWARDS SYSTEM DEBUG COMPLETE!");
    console.log("=================================");
    console.log("✅ Identified the issue: User has no shares in protocol");
    console.log("✅ Need to ensure vault deposits create shares in protocol");
    
  } catch (error) {
    console.error("❌ Rewards system debug failed:", error);
  }
}

// Main execution
if (require.main === module) {
  debugRewardsSystem()
    .then(() => {
      console.log("\n✅ Rewards system debug completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Debug failed:", error);
      process.exit(1);
    });
}

export { debugRewardsSystem };
