import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Adding native token (STT) support to YieldMind Vault...");

  // Get the deployed contract
  const vaultAddress = "0xE1173422100262BA7B1D2141ACC629f8a8F07370"; // Somnia testnet
  const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
  const vault = YieldMindVault.attach(vaultAddress);

  try {
    // Add native token (address(0)) support
    const tx = await vault.addSupportedToken(
      ethers.ZeroAddress, // address(0) for native tokens
      ethers.parseEther("0.1"), // minimum deposit: 0.1 STT
      ethers.parseEther("1000") // maximum deposit: 1000 STT
    );

    console.log("📝 Transaction submitted:", tx.hash);
    await tx.wait();
    console.log("✅ Native token (STT) support added successfully!");

    // Verify the token is supported
    const tokenInfo = await vault.supportedTokens(ethers.ZeroAddress);
    console.log("🔍 Native token info:", {
      isSupported: tokenInfo.isSupported,
      minDeposit: ethers.formatEther(tokenInfo.minDeposit),
      maxDeposit: ethers.formatEther(tokenInfo.maxDeposit)
    });

  } catch (error) {
    console.error("❌ Error adding native token support:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
