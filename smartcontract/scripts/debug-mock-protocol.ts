import { ethers } from "hardhat";

async function debugMockProtocol() {
  console.log("🔍 Debugging Mock Protocol...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  
  try {
    const mockProtocolAddress = "0xb5127d7A36E34d45711c9B8EfDf16b4E2D7101CE";
    
    console.log("\n📋 Mock Protocol Address:");
    console.log(`Address: ${mockProtocolAddress}`);
    
    // Test 1: Check if contract exists
    console.log("\n🔍 Test 1: Contract Existence");
    try {
      const code = await ethers.provider.getCode(mockProtocolAddress);
      if (code === "0x") {
        console.log("❌ No contract deployed at this address");
        return;
      } else {
        console.log("✅ Contract exists at address");
      }
    } catch (error) {
      console.log("❌ Error checking contract existence:", (error as Error).message);
      return;
    }
    
    // Test 2: Try to get contract instance
    console.log("\n🔍 Test 2: Contract Instance");
    try {
      const mockProtocol = await ethers.getContractAt("MockSomniaProtocol", mockProtocolAddress);
      console.log("✅ Contract instance created successfully");
      
      // Test 3: Check basic functions
      console.log("\n🔍 Test 3: Basic Functions");
      try {
        const balance = await mockProtocol.getBalance();
        console.log(`✅ getBalance(): ${ethers.formatEther(balance)} STT`);
      } catch (error) {
        console.log("❌ getBalance() failed:", (error as Error).message);
      }
      
      try {
        const apy = await mockProtocol.getAPY();
        console.log(`✅ getAPY(): ${apy.toString()}%`);
      } catch (error) {
        console.log("❌ getAPY() failed:", (error as Error).message);
      }
      
      try {
        const totalDeposits = await mockProtocol.getTotalDeposits();
        console.log(`✅ getTotalDeposits(): ${ethers.formatEther(totalDeposits)} STT`);
      } catch (error) {
        console.log("❌ getTotalDeposits() failed:", (error as Error).message);
      }
      
      try {
        const totalShares = await mockProtocol.getTotalShares();
        console.log(`✅ getTotalShares(): ${ethers.formatEther(totalShares)} STT`);
      } catch (error) {
        console.log("❌ getTotalShares() failed:", (error as Error).message);
      }
      
      try {
        const supportsNative = await mockProtocol.supportsNativeToken();
        console.log(`✅ supportsNativeToken(): ${supportsNative}`);
      } catch (error) {
        console.log("❌ supportsNativeToken() failed:", (error as Error).message);
      }
      
    } catch (error) {
      console.log("❌ Contract instance creation failed:", (error as Error).message);
    }
    
    // Test 4: Try with manual ABI
    console.log("\n🔍 Test 4: Manual ABI");
    try {
      const mockProtocolContract = new ethers.Contract(
        mockProtocolAddress,
        [
          'function getBalance() view returns (uint256)',
          'function getAPY() view returns (uint256)',
          'function getTotalDeposits() view returns (uint256)',
          'function getTotalShares() view returns (uint256)',
          'function supportsNativeToken() view returns (bool)'
        ],
        deployer
      );
      
      console.log("✅ Manual contract instance created");
      
      const balance = await mockProtocolContract.getBalance();
      console.log(`✅ getBalance(): ${ethers.formatEther(balance)} STT`);
      
      const apy = await mockProtocolContract.getAPY();
      console.log(`✅ getAPY(): ${apy.toString()}%`);
      
      const totalDeposits = await mockProtocolContract.getTotalDeposits();
      console.log(`✅ getTotalDeposits(): ${ethers.formatEther(totalDeposits)} STT`);
      
      const totalShares = await mockProtocolContract.getTotalShares();
      console.log(`✅ getTotalShares(): ${ethers.formatEther(totalShares)} STT`);
      
      const supportsNative = await mockProtocolContract.supportsNativeToken();
      console.log(`✅ supportsNativeToken(): ${supportsNative}`);
      
    } catch (error) {
      console.log("❌ Manual ABI failed:", (error as Error).message);
    }
    
    console.log("\n🎯 MOCK PROTOCOL DEBUG COMPLETE!");
    
  } catch (error) {
    console.error("❌ Mock protocol debug failed:", error);
  }
}

// Main execution
if (require.main === module) {
  debugMockProtocol()
    .then(() => {
      console.log("\n✅ Mock protocol debug completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Debug failed:", error);
      process.exit(1);
    });
}

export { debugMockProtocol };
