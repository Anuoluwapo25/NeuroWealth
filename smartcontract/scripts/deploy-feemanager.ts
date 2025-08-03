import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FeeManager only...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "CFX");

  // Already deployed contract addresses
  const mindTokenAddress = "0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4";
  const mindStakingAddress = "0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4";
  
  console.log("📋 Using already deployed contracts:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);

  // Deploy FeeManager with minimal gas
  console.log("\n🚀 Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await FeeManager.deploy(
    mindTokenAddress,
    mindStakingAddress,
    deployer.address, // devTreasury
    "0x0000000000000000000000000000000000000000", // placeholder DEX router
    {
      gasLimit: 1000000 // Minimal gas limit
    }
  );
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log("✅ FeeManager deployed to:", feeManagerAddress);

  console.log("\n🎉 FeeManager deployment completed!");
  console.log("📋 Contract Address:", feeManagerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 