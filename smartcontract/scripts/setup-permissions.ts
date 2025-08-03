import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Setting up permissions for deployed contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Setting up with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "CFX");

  // Deployed contract addresses
  const mindTokenAddress = "0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4";
  const mindStakingAddress = "0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4";
  const aiStrategyManagerAddress = "0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5";
  const yieldMindVaultAddress = "0xD2D2cE855a37FB1FbbF131D869f3c17847B952F9";
  
  console.log("📋 Using deployed contracts:");
  console.log("MIND Token:", mindTokenAddress);
  console.log("MINDStaking:", mindStakingAddress);
  console.log("AIStrategyManager:", aiStrategyManagerAddress);
  console.log("YieldMindVault:", yieldMindVaultAddress);

  // Get the MIND token contract instance
  const mindToken = await ethers.getContractAt("MIND", mindTokenAddress);
  
  // Add MINDStaking as minter for MIND token
  console.log("\n🔧 Adding MINDStaking as minter...");
  try {
    const addMinterTx = await mindToken.addMinter(mindStakingAddress, {
      gasLimit: 50000 // Very minimal gas
    });
    await addMinterTx.wait();
    console.log("✅ MINDStaking added as minter for MIND token");
  } catch (error) {
    console.log("⚠️ MINDStaking might already be a minter:", error);
  }

  console.log("\n🎉 Permissions setup completed!");
  console.log("📋 Next steps:");
  console.log("1. Get more CFX for FeeManager deployment");
  console.log("2. Deploy FeeManager: npm run deploy:feemanager");
  console.log("3. Add FeeManager as minter for MIND token");
  console.log("4. Set up FeeManager thresholds");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }); 