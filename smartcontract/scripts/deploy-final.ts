import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Final YieldMind deployment on CrossFi chain...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "CFX");

  // Already deployed contract addresses
  const mindTokenAddress = "0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4";
  const mindStakingAddress = "0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4";
  const aiStrategyManagerAddress = "0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5";
  
  console.log("📋 Using already deployed contracts:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerAddress);

  // Deploy YieldMindVault with optimized gas
  console.log("\n4️⃣ Deploying YieldMindVault...");
  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const yieldMindVault = await YieldMindVault.deploy(mindStakingAddress, aiStrategyManagerAddress, {
    gasLimit: 5000000 // Reduced gas limit
  });
  await yieldMindVault.waitForDeployment();
  const yieldMindVaultAddress = await yieldMindVault.getAddress();
  console.log("✅ YieldMindVault deployed to:", yieldMindVaultAddress);

  // Deploy FeeManager with optimized gas
  console.log("\n5️⃣ Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await FeeManager.deploy(
    mindTokenAddress,
    mindStakingAddress,
    deployer.address, // devTreasury
    "0x0000000000000000000000000000000000000000", // placeholder DEX router
    {
      gasLimit: 4000000 // Reduced gas limit
    }
  );
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log("✅ FeeManager deployed to:", feeManagerAddress);

  // Setup initial permissions with optimized gas
  console.log("\n6️⃣ Setting up initial permissions...");
  
  // Get the MIND token contract instance
  const mindToken = await ethers.getContractAt("MIND", mindTokenAddress);
  
  // Add MINDStaking as minter for MIND token
  const addMinterTx = await mindToken.addMinter(mindStakingAddress, {
    gasLimit: 100000 // Minimal gas for simple function
  });
  await addMinterTx.wait();
  console.log("✅ MINDStaking added as minter for MIND token");

  // Add FeeManager as minter for MIND token
  const addFeeManagerMinterTx = await mindToken.addMinter(feeManagerAddress, {
    gasLimit: 100000 // Minimal gas for simple function
  });
  await addFeeManagerMinterTx.wait();
  console.log("✅ FeeManager added as minter for MIND token");

  // Set distribution thresholds for FeeManager
  console.log("\n7️⃣ Setting up FeeManager thresholds...");
  const setThresholdTx = await feeManager.setDistributionThreshold(
    mindTokenAddress,
    1000 * 1e18, // 1000 MIND tokens threshold
    {
      gasLimit: 100000 // Minimal gas for simple function
    }
  );
  await setThresholdTx.wait();
  console.log("✅ FeeManager distribution threshold set");

  console.log("\n🎉 Final deployment completed successfully!");
  console.log("\n📋 Complete Contract Addresses:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerAddress);
  console.log("YieldMindVault:", yieldMindVaultAddress);
  console.log("FeeManager:", feeManagerAddress);
  console.log("\n🔗 Next steps:");
  console.log("1. Verify contracts on CrossFi explorer");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test contract interactions");
  console.log("4. Add real protocol addresses to AIStrategyManager");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 