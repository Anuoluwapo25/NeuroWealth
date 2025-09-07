import { ethers } from "hardhat";

async function simpleContractTest() {
  console.log("🧪 Simple Contract Function Test...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0xA0d819782Aa0E96F1b36B6971705716c6e92b1eC";
    const strategyManagerAddress = "0x0D2a8DcE89E496130286BD60c1451E968EfB1A86";
    
    console.log("\n📋 Contract Addresses:");
    console.log(`Vault: ${vaultAddress}`);
    console.log(`Strategy Manager: ${strategyManagerAddress}`);
    
    // Test 1: Direct contract call using ethers.Contract
    console.log("\n🔍 Test 1: Direct Contract Call");
    try {
      const vaultABI = [
        "function deposit(uint256 amount) external payable",
        "function paused() external view returns (bool)",
        "function MIN_DEPOSIT() external view returns (uint256)",
        "function MAX_DEPOSIT() external view returns (uint256)",
        "function userPositions(address) external view returns (uint256, uint256, uint256, uint256)"
      ];
      
      const vault = new ethers.Contract(vaultAddress, vaultABI, deployer);
      
      // Test basic functions
      const isPaused = await vault.paused();
      const minDeposit = await vault.MIN_DEPOSIT();
      const maxDeposit = await vault.MAX_DEPOSIT();
      
      console.log(`✅ Vault paused: ${isPaused}`);
      console.log(`✅ Min deposit: ${ethers.formatEther(minDeposit)} STT`);
      console.log(`✅ Max deposit: ${ethers.formatEther(maxDeposit)} STT`);
      
      // Test deposit
      const testAmount = ethers.parseEther("0.1");
      console.log(`\n🔄 Testing deposit with ${ethers.formatEther(testAmount)} STT...`);
      
      const depositTx = await vault.deposit(testAmount, { value: testAmount });
      console.log(`✅ Deposit transaction sent: ${depositTx.hash}`);
      
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit confirmed: ${receipt?.hash}`);
      console.log(`✅ Transaction status: ${receipt?.status}`);
      
      if (receipt?.status === 1) {
        console.log("🎉 DEPOSIT SUCCESSFUL!");
        
        // Check user position
        const userPosition = await vault.userPositions(deployer.address);
        console.log(`User principal: ${ethers.formatEther(userPosition[0])} STT`);
        console.log(`User current value: ${ethers.formatEther(userPosition[1])} STT`);
        
      } else {
        console.log("❌ Deposit transaction reverted");
      }
      
    } catch (error) {
      console.log("❌ Direct contract call failed:", (error as Error).message);
    }
    
    // Test 2: Strategy Manager direct call
    console.log("\n🔍 Test 2: Strategy Manager Direct Call");
    try {
      const strategyManagerABI = [
        "function executeStrategy(uint256 amount, address token) external",
        "function rebalancePortfolio(address user) external",
        "function yieldMindVault() external view returns (address)"
      ];
      
      const strategyManager = new ethers.Contract(strategyManagerAddress, strategyManagerABI, deployer);
      
      // Check vault address
      const vaultAddr = await strategyManager.yieldMindVault();
      console.log(`✅ Strategy manager vault address: ${vaultAddr}`);
      
      // Test executeStrategy (this should fail because only vault can call it)
      const testAmount = ethers.parseEther("0.1");
      try {
        const gasEstimate = await strategyManager.estimateGas.executeStrategy(testAmount, ethers.ZeroAddress);
        console.log(`✅ Strategy manager executeStrategy gas estimate: ${gasEstimate.toString()}`);
      } catch (error) {
        console.log("❌ Strategy manager executeStrategy failed (expected):", (error as Error).message);
      }
      
    } catch (error) {
      console.log("❌ Strategy manager direct call failed:", (error as Error).message);
    }
    
    console.log("\n🎯 SIMPLE CONTRACT TEST COMPLETE!");
    console.log("=================================");
    
  } catch (error) {
    console.error("❌ Simple test failed:", error);
  }
}

// Main execution
if (require.main === module) {
  simpleContractTest()
    .then(() => {
      console.log("\n✅ Simple contract test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Simple test failed:", error);
      process.exit(1);
    });
}

export { simpleContractTest };
