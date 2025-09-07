import { ethers } from "hardhat";

async function testIntegration() {
  console.log("🧪 Testing Vault Integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    // Contract addresses
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    const strategyManagerAddress = "0xE75CA0E9C69DE3a0979DD6A3dac384b398580c92";
    const mockProtocolAddress = "0x6F1c57D52A55BDE37C556bcb003255448D36917f";
    const mockMindStakingAddress = "0xA529547b901F9613b2e0E1F171B7864d8172e674";
    
    console.log("\n📋 Contract Addresses:");
    console.log(`Vault: ${vaultAddress}`);
    console.log(`Strategy Manager: ${strategyManagerAddress}`);
    console.log(`Mock Protocol: ${mockProtocolAddress}`);
    console.log(`Mock MindStaking: ${mockMindStakingAddress}`);
    
    // Get contracts
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = YieldMindVault.attach(vaultAddress);
    
    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = AIStrategyManagerV2.attach(strategyManagerAddress);
    
    const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
    const mockProtocol = MockSomniaProtocol.attach(mockProtocolAddress);
    
    const MockMindStaking = await ethers.getContractFactory("MockMindStaking");
    const mockMindStaking = MockMindStaking.attach(mockMindStakingAddress);
    
    console.log("\n🔍 Contract Attachments:");
    console.log(`✅ Vault contract: ${vault.target}`);
    console.log(`✅ Strategy Manager contract: ${strategyManager.target}`);
    console.log(`✅ Mock Protocol contract: ${mockProtocol.target}`);
    console.log(`✅ Mock MindStaking contract: ${mockMindStaking.target}`);
    
    // Test 1: Check vault state
    console.log("\n🔍 Test 1: Vault State");
    const isPaused = await vault.paused();
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    
    console.log(`✅ Vault paused: ${isPaused}`);
    console.log(`✅ Min deposit: ${ethers.formatEther(minDeposit)} STT`);
    console.log(`✅ Max deposit: ${ethers.formatEther(maxDeposit)} STT`);
    
    // Test 2: Check strategy manager vault address
    console.log("\n🔍 Test 2: Strategy Manager Vault Address");
    const strategyManagerVaultAddress = await strategyManager.yieldMindVault();
    console.log(`✅ Strategy manager vault address: ${strategyManagerVaultAddress}`);
    console.log(`✅ Matches vault address: ${strategyManagerVaultAddress === vaultAddress}`);
    
    // Test 3: Check user tier
    console.log("\n🔍 Test 3: User Tier");
    const userTier = await mockMindStaking.getUserTier(deployer.address);
    console.log(`✅ User tier: ${userTier} (0=Free, 1=Premium, 2=Pro)`);
    
    // Test 4: Check mock protocol
    console.log("\n🔍 Test 4: Mock Protocol");
    const protocolInfo = await mockProtocol.getProtocolInfo();
    console.log(`✅ Protocol APY: ${protocolInfo.apy} basis points (${Number(protocolInfo.apy) / 100}%)`);
    console.log(`✅ Protocol active: ${protocolInfo.isActive}`);
    console.log(`✅ Total deposits: ${ethers.formatEther(protocolInfo.totalDeposits)} STT`);
    
    // Test 5: Test deposit (small amount)
    console.log("\n🔍 Test 5: Test Deposit");
    const testAmount = ethers.parseEther("0.1"); // 0.1 STT
    
    try {
      // Estimate gas for deposit
      const gasEstimate = await vault.estimateGas.deposit(testAmount, { value: testAmount });
      console.log(`✅ Deposit gas estimate: ${gasEstimate.toString()}`);
      
      // Try to execute deposit
      const depositTx = await vault.deposit(testAmount, { value: testAmount });
      console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
      
      // Wait for confirmation
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
      console.log(`✅ Transaction status: ${receipt?.status}`);
      
      if (receipt?.status === 1) {
        console.log("🎉 DEPOSIT SUCCESSFUL! Integration is working!");
        
        // Check user position
        const userPosition = await vault.userPositions(deployer.address);
        console.log(`✅ User principal: ${ethers.formatEther(userPosition.principal)} STT`);
        console.log(`✅ User current value: ${ethers.formatEther(userPosition.currentValue)} STT`);
        
      } else {
        console.log("❌ Deposit transaction reverted");
      }
      
    } catch (error) {
      console.log("❌ Deposit test failed:", (error as Error).message);
    }
    
    console.log("\n🎯 INTEGRATION TEST COMPLETE!");
    console.log("=============================");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  testIntegration()
    .then(() => {
      console.log("\n✅ Integration test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

export { testIntegration };
