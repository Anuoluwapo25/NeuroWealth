import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying YieldMindVault only...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "CFX");

  // Already deployed contract addresses
  const mindStakingAddress = "0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4";
  const aiStrategyManagerAddress = "0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5";
  
  console.log("📋 Using already deployed contracts:");
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerAddress);

  // Deploy YieldMindVault with minimal gas
  console.log("\n🚀 Deploying YieldMindVault...");
  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const yieldMindVault = await YieldMindVault.deploy(mindStakingAddress, aiStrategyManagerAddress, {
    gasLimit: 2000000 // Even more reduced gas limit
  });
  await yieldMindVault.waitForDeployment();
  const yieldMindVaultAddress = await yieldMindVault.getAddress();
  console.log("✅ YieldMindVault deployed to:", yieldMindVaultAddress);

  console.log("\n🎉 YieldMindVault deployment completed!");
  console.log("📋 Contract Address:", yieldMindVaultAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 