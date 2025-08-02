import { run } from "hardhat";

async function main() {
  console.log("🔍 Starting contract verification on CrossFi explorer...");

  // Contract addresses from deployment (replace with actual addresses)
  const MIND_TOKEN_ADDRESS = "0x..."; // Replace with actual address
  const MIND_STAKING_ADDRESS = "0x..."; // Replace with actual address
  const AI_STRATEGY_MANAGER_ADDRESS = "0x..."; // Replace with actual address
  const YIELD_MIND_VAULT_ADDRESS = "0x..."; // Replace with actual address
  const FEE_MANAGER_ADDRESS = "0x..."; // Replace with actual address

  try {
    // Verify MIND token
    console.log("1️⃣ Verifying MIND token...");
    await run("verify:verify", {
      address: MIND_TOKEN_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ MIND token verified");

    // Verify MINDStaking
    console.log("2️⃣ Verifying MINDStaking...");
    await run("verify:verify", {
      address: MIND_STAKING_ADDRESS,
      constructorArguments: [MIND_TOKEN_ADDRESS],
    });
    console.log("✅ MINDStaking verified");

    // Verify AIStrategyManager
    console.log("3️⃣ Verifying AIStrategyManager...");
    await run("verify:verify", {
      address: AI_STRATEGY_MANAGER_ADDRESS,
      constructorArguments: [YIELD_MIND_VAULT_ADDRESS],
    });
    console.log("✅ AIStrategyManager verified");

    // Verify YieldMindVault
    console.log("4️⃣ Verifying YieldMindVault...");
    await run("verify:verify", {
      address: YIELD_MIND_VAULT_ADDRESS,
      constructorArguments: [MIND_STAKING_ADDRESS, AI_STRATEGY_MANAGER_ADDRESS],
    });
    console.log("✅ YieldMindVault verified");

    // Verify FeeManager
    console.log("5️⃣ Verifying FeeManager...");
    await run("verify:verify", {
      address: FEE_MANAGER_ADDRESS,
      constructorArguments: [
        MIND_TOKEN_ADDRESS,
        MIND_STAKING_ADDRESS,
        "0x...", // devTreasury address
        "0x0000000000000000000000000000000000000000", // DEX router address
      ],
    });
    console.log("✅ FeeManager verified");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("🔗 View contracts on CrossFi explorer:");
    console.log(`MIND Token: https://explorer.crossfi.com/address/${MIND_TOKEN_ADDRESS}`);
    console.log(`MINDStaking: https://explorer.crossfi.com/address/${MIND_STAKING_ADDRESS}`);
    console.log(`AIStrategyManager: https://explorer.crossfi.com/address/${AI_STRATEGY_MANAGER_ADDRESS}`);
    console.log(`YieldMindVault: https://explorer.crossfi.com/address/${YIELD_MIND_VAULT_ADDRESS}`);
    console.log(`FeeManager: https://explorer.crossfi.com/address/${FEE_MANAGER_ADDRESS}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  }); 