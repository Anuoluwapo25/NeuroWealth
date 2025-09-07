import { ethers } from "hardhat";

async function traceDepositRevert() {
  console.log("🔍 Tracing Deposit Revert Step by Step...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Tracing with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    const strategyManagerAddress = "0x0D2a8DcE89E496130286BD60c1451E968EfB1A86";
    const mockMindStakingAddress = "0xA529547b901F9613b2e0E1F171B7864d8172e674";
    
    console.log("\n📋 Contract Addresses:");
    console.log(`Vault: ${vaultAddress}`);
    console.log(`Strategy Manager: ${strategyManagerAddress}`);
    console.log(`Mock MindStaking: ${mockMindStakingAddress}`);
    
    // Get contracts
    const vault = await ethers.getContractAt("YieldMindVault", vaultAddress);
    const strategyManager = await ethers.getContractAt("AIStrategyManagerV2", strategyManagerAddress);
    const mockMindStaking = await ethers.getContractAt("MockMindStaking", mockMindStakingAddress);
    
    console.log("\n✅ All contracts retrieved");
    
    // Step 1: Check all vault requirements
    console.log("\n🔍 Step 1: Vault Requirements Check");
    
    // Check if vault is paused
    const isPaused = await vault.paused();
    console.log(`✅ Vault paused: ${isPaused}`);
    if (isPaused) {
      console.log("❌ Vault is paused - this will cause revert");
      return;
    }
    
    // Check min/max deposit
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    console.log(`✅ Min deposit: ${ethers.formatEther(minDeposit)} STT`);
    console.log(`✅ Max deposit: ${ethers.formatEther(maxDeposit)} STT`);
    
    const testAmount = ethers.parseEther("0.1");
    console.log(`✅ Test amount: ${ethers.formatEther(testAmount)} STT`);
    
    if (testAmount < minDeposit) {
      console.log("❌ Test amount below minimum - this will cause revert");
      return;
    }
    if (testAmount > maxDeposit) {
      console.log("❌ Test amount above maximum - this will cause revert");
      return;
    }
    
    // Step 2: Check MindStaking integration
    console.log("\n🔍 Step 2: MindStaking Integration Check");
    
    const userTier = await mockMindStaking.getUserTier(deployer.address);
    console.log(`✅ User tier: ${userTier} (0=Free, 1=Premium, 2=Pro)`);
    
    // Step 3: Check strategy manager integration
    console.log("\n🔍 Step 3: Strategy Manager Integration Check");
    
    const vaultStrategyManager = await vault.strategyManager();
    console.log(`✅ Vault strategy manager: ${vaultStrategyManager}`);
    console.log(`✅ Matches expected: ${vaultStrategyManager === strategyManagerAddress}`);
    
    const strategyManagerVault = await strategyManager.yieldMindVault();
    console.log(`✅ Strategy manager vault: ${strategyManagerVault}`);
    console.log(`✅ Matches expected: ${strategyManagerVault === vaultAddress}`);
    
    // Step 4: Check user position limits
    console.log("\n🔍 Step 4: User Position Limits Check");
    
    const userPosition = await vault.userPositions(deployer.address);
    console.log(`✅ Current principal: ${ethers.formatEther(userPosition.principal)} STT`);
    console.log(`✅ Current value: ${ethers.formatEther(userPosition.currentValue)} STT`);
    
    const newTotal = userPosition.principal + testAmount;
    console.log(`✅ New total would be: ${ethers.formatEther(newTotal)} STT`);
    
    // Check tier limits
    const tierLimits = await vault.tierLimits(userTier);
    console.log(`✅ Tier ${userTier} limit: ${ethers.formatEther(tierLimits)} STT`);
    
    if (newTotal > tierLimits) {
      console.log("❌ New total exceeds tier limit - this will cause revert");
      return;
    }
    
    // Step 5: Test strategy manager executeStrategy function
    console.log("\n🔍 Step 5: Strategy Manager Function Test");
    
    try {
      // Try to call executeStrategy directly (this should fail with "Only vault can call")
      const gasEstimate = await strategyManager.estimateGas.executeStrategy(testAmount, ethers.ZeroAddress);
      console.log("❌ Strategy manager executeStrategy should have failed but didn't");
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("Only vault can call")) {
        console.log("✅ Strategy manager correctly rejects direct calls");
      } else {
        console.log("❌ Strategy manager error:", errorMessage);
      }
    }
    
    // Step 6: Try to simulate the vault's deposit logic
    console.log("\n🔍 Step 6: Simulating Vault Deposit Logic");
    
    // Check if the issue is in the strategy manager call
    try {
      // This is what the vault does internally
      console.log("Testing strategy manager call from vault context...");
      
      // We can't directly test this because we're not the vault, but we can check if the function exists
      const strategyManagerABI = [
        "function executeStrategy(uint256 amount, address token) external"
      ];
      const strategyManagerContract = new ethers.Contract(strategyManagerAddress, strategyManagerABI, deployer);
      
      // This should fail because we're not the vault
      try {
        await strategyManagerContract.executeStrategy(testAmount, ethers.ZeroAddress);
        console.log("❌ Strategy manager call succeeded when it should have failed");
      } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes("Only vault can call")) {
          console.log("✅ Strategy manager correctly enforces vault-only access");
        } else {
          console.log("❌ Strategy manager error:", errorMessage);
        }
      }
      
    } catch (error) {
      console.log("❌ Strategy manager simulation failed:", (error as Error).message);
    }
    
    // Step 7: Try the actual deposit with detailed error handling
    console.log("\n🔍 Step 7: Actual Deposit Test");
    
    try {
      console.log("🔄 Attempting deposit...");
      const depositTx = await vault.deposit(testAmount, { value: testAmount });
      console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
      
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
      console.log(`✅ Transaction status: ${receipt?.status}`);
      
      if (receipt?.status === 1) {
        console.log("🎉 DEPOSIT SUCCESSFUL!");
        
        // Check user position
        const newUserPosition = await vault.userPositions(deployer.address);
        console.log(`User principal: ${ethers.formatEther(newUserPosition.principal)} STT`);
        console.log(`User current value: ${ethers.formatEther(newUserPosition.currentValue)} STT`);
        
      } else {
        console.log("❌ Deposit transaction reverted");
      }
      
    } catch (error) {
      console.log("❌ Deposit failed:", (error as Error).message);
      
      // Try to get more specific error information
      if (error instanceof Error) {
        if (error.message.includes("execution reverted")) {
          console.log("🔍 This is an execution revert - the issue is likely in the vault's internal logic");
          console.log("🔍 Possible causes:");
          console.log("  1. Strategy manager executeStrategy function not working");
          console.log("  2. MindStaking getUserTier function issue");
          console.log("  3. Tier limit calculation issue");
          console.log("  4. Some other require statement in the vault");
        }
      }
    }
    
    console.log("\n🎯 TRACING COMPLETE!");
    console.log("===================");
    
  } catch (error) {
    console.error("❌ Tracing failed:", error);
  }
}

// Main execution
if (require.main === module) {
  traceDepositRevert()
    .then(() => {
      console.log("\n✅ Tracing completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Tracing failed:", error);
      process.exit(1);
    });
}

export { traceDepositRevert };
