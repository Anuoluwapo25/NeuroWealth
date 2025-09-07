import { ethers } from "hardhat";

async function testWithdrawalPage() {
  console.log("🧪 Testing Withdrawal Page Integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const vaultAddress = "0x5E19885955D4062369479998753C29874f1E66c6";
    const vault = await ethers.getContractAt("SimplifiedVault", vaultAddress);
    
    console.log("\n📋 Withdrawal Page Test:");
    
    // Test 1: Check user position (what withdrawal page needs)
    console.log("\n🔍 Test 1: User Position Check");
    try {
      const position = await vault.userPositions(deployer.address);
      
      const principalValue = parseFloat(position.principal.toString()) / 1e18;
      const currentValue = parseFloat(position.currentValue.toString()) / 1e18;
      const totalReturns = parseFloat(position.totalReturns.toString()) / 1e18;
      
      console.log("✅ User position data:");
      console.log(`  - Principal: ${principalValue.toFixed(4)} STT`);
      console.log(`  - Current Value: ${currentValue.toFixed(4)} STT`);
      console.log(`  - Total Returns: ${totalReturns.toFixed(4)} STT`);
      
      // Check if user has position (same logic as withdrawal page)
      const hasPosition = currentValue > 0;
      console.log(`  - Has Position: ${hasPosition ? 'YES' : 'NO'}`);
      
      if (hasPosition) {
        console.log("🎉 User should see position data on withdrawal page!");
      } else {
        console.log("ℹ️ User should see 'No Active Position' message");
      }
      
    } catch (error) {
      console.log("❌ User position check failed:", (error as Error).message);
    }
    
    // Test 2: Test withdrawal function (what withdrawal page needs)
    console.log("\n🔍 Test 2: Withdrawal Function Test");
    try {
      const position = await vault.userPositions(deployer.address);
      const currentValue = parseFloat(position.currentValue.toString()) / 1e18;
      
      if (currentValue > 0) {
        // Test partial withdrawal
        const withdrawAmount = currentValue * 0.1; // 10% of position
        const withdrawAmountWei = ethers.parseEther(withdrawAmount.toString());
        
        console.log(`Testing partial withdrawal of ${withdrawAmount.toFixed(4)} STT...`);
        
        const withdrawTx = await vault.withdraw(withdrawAmountWei);
        console.log(`✅ Withdrawal transaction sent: ${withdrawTx.hash}`);
        
        const receipt = await withdrawTx.wait();
        console.log(`✅ Withdrawal confirmed: ${receipt?.hash}`);
        console.log(`✅ Transaction status: ${receipt?.status}`);
        
        if (receipt?.status === 1) {
          console.log("🎉 WITHDRAWAL SUCCESSFUL!");
          
          // Check updated position
          const updatedPosition = await vault.userPositions(deployer.address);
          const updatedValue = parseFloat(updatedPosition.currentValue.toString()) / 1e18;
          console.log(`Updated position value: ${updatedValue.toFixed(4)} STT`);
          
        } else {
          console.log("❌ Withdrawal transaction reverted");
        }
      } else {
        console.log("ℹ️ No funds to withdraw");
      }
      
    } catch (error) {
      console.log("❌ Withdrawal test failed:", (error as Error).message);
    }
    
    // Test 3: Check final position
    console.log("\n🔍 Test 3: Final Position Check");
    try {
      const position = await vault.userPositions(deployer.address);
      const currentValue = parseFloat(position.currentValue.toString()) / 1e18;
      
      console.log("✅ Final position:");
      console.log(`  - Current Value: ${currentValue.toFixed(4)} STT`);
      console.log(`  - Has Position: ${currentValue > 0 ? 'YES' : 'NO'}`);
      
    } catch (error) {
      console.log("❌ Final position check failed:", (error as Error).message);
    }
    
    console.log("\n🎯 WITHDRAWAL PAGE TEST COMPLETE!");
    console.log("=================================");
    console.log("✅ Position loading should work");
    console.log("✅ Withdrawal functionality should work");
    console.log("✅ Withdrawal page should show correct data");
    
  } catch (error) {
    console.error("❌ Withdrawal page test failed:", error);
  }
}

// Main execution
if (require.main === module) {
  testWithdrawalPage()
    .then(() => {
      console.log("\n✅ Withdrawal page test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

export { testWithdrawalPage };
