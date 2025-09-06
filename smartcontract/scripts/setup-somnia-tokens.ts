import { ethers } from "hardhat";

async function main() {
  console.log("Setting up supported tokens for Somnia network...");

  // Get the deployed contracts
  const yieldMindVaultAddress = "0xE1173422100262BA7B1D2141ACC629f8a8F07370";

  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const vault = YieldMindVault.attach(yieldMindVaultAddress);

  // Somnia token addresses (these would be the actual deployed addresses on Somnia)
  // For now, using placeholder addresses - replace with real addresses when deploying
  const somniaTokens = {
    // Native Somnia token
    SOMI: "0x0000000000000000000000000000000000000000", // Placeholder - replace with actual SOMI token address
    
    // Stablecoins (if bridged to Somnia)
    USDC: "0x0000000000000000000000000000000000000001", // Placeholder - replace with actual USDC address on Somnia
    USDT: "0x0000000000000000000000000000000000000002", // Placeholder - replace with actual USDT address on Somnia
    DAI: "0x0000000000000000000000000000000000000003", // Placeholder - replace with actual DAI address on Somnia
  };

  // Token configurations
  const tokenConfigs = [
    {
      address: somniaTokens.SOMI,
      name: "SOMI",
      minDeposit: ethers.parseEther("10"), // 10 SOMI minimum
      maxDeposit: ethers.parseEther("1000000"), // 1M SOMI maximum
    },
    {
      address: somniaTokens.USDC,
      name: "USDC",
      minDeposit: ethers.parseUnits("100", 6), // $100 minimum (6 decimals for USDC)
      maxDeposit: ethers.parseUnits("10000000", 6), // $10M maximum
    },
    {
      address: somniaTokens.USDT,
      name: "USDT", 
      minDeposit: ethers.parseUnits("100", 6), // $100 minimum (6 decimals for USDT)
      maxDeposit: ethers.parseUnits("10000000", 6), // $10M maximum
    },
    {
      address: somniaTokens.DAI,
      name: "DAI",
      minDeposit: ethers.parseEther("100"), // 100 DAI minimum (18 decimals)
      maxDeposit: ethers.parseEther("10000000"), // 10M DAI maximum
    },
  ];

  console.log("Adding supported tokens to YieldMind Vault...");

  for (const config of tokenConfigs) {
    try {
      console.log(`Adding ${config.name} (${config.address})...`);
      
      const tx = await vault.addSupportedToken(
        config.address,
        config.minDeposit,
        config.maxDeposit
      );
      
      await tx.wait();
      console.log(`✅ ${config.name} added successfully!`);
      console.log(`   Min Deposit: ${ethers.formatEther(config.minDeposit)} ${config.name}`);
      console.log(`   Max Deposit: ${ethers.formatEther(config.maxDeposit)} ${config.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to add ${config.name}:`, error);
    }
  }

  console.log("\n🎉 Somnia token setup completed!");
  console.log("\nSupported tokens:");
  console.log("- SOMI (Native Somnia token)");
  console.log("- USDC (USD Coin)");
  console.log("- USDT (Tether USD)");
  console.log("- DAI (Dai Stablecoin)");
  
  console.log("\n📝 Next steps:");
  console.log("1. Replace placeholder addresses with actual token addresses on Somnia");
  console.log("2. Verify tokens are properly bridged/deployed on Somnia");
  console.log("3. Test deposits with each supported token");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
