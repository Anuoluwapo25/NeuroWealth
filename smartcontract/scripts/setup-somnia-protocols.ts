import { ethers } from "hardhat";

async function main() {
  console.log("Setting up Somnia DeFi protocols for AI Strategy Manager...");

  // Get the deployed AI Strategy Manager contract
  const aiStrategyManagerAddress = "0x902CF9fC71d391320B9736A7e88B063AEf6608aC";

  const AIStrategyManager = await ethers.getContractFactory("AIStrategyManager");
  const strategyManager = AIStrategyManager.attach(aiStrategyManagerAddress);

  // Somnia DeFi Protocol configurations
  // These addresses would be the actual deployed protocol addresses on Somnia
  const somniaProtocols = [
    {
      name: "Standard Protocol",
      address: "0x0000000000000000000000000000000000000001", // Placeholder - replace with actual Standard Protocol address
      description: "Fully on-chain CLOB with spot/perpetual trading, lending, and yield strategies",
      initialAPY: 1200, // 12% APY in basis points
      riskScore: 25, // Low risk (1-100 scale, lower = safer)
      tvl: ethers.parseEther("10000000"), // 10M TVL placeholder
    },
    {
      name: "QuickSwap",
      address: "0x0000000000000000000000000000000000000002", // Placeholder - replace with actual QuickSwap address
      description: "DEX with swaps, LP staking, yield farming, and governance",
      initialAPY: 1800, // 18% APY in basis points
      riskScore: 30, // Low-medium risk
      tvl: ethers.parseEther("50000000"), // 50M TVL placeholder
    },
    {
      name: "Haifu.fun",
      address: "0x0000000000000000000000000000000000000003", // Placeholder - replace with actual Haifu.fun address
      description: "AI-powered autonomous trading agents (wAIfus) for portfolio management",
      initialAPY: 2500, // 25% APY in basis points
      riskScore: 60, // Medium-high risk (AI strategies can be volatile)
      tvl: ethers.parseEther("5000000"), // 5M TVL placeholder
    },
    {
      name: "Salt Treasury",
      address: "0x0000000000000000000000000000000000000004", // Placeholder - replace with actual Salt address
      description: "Self-custodial treasury coordination with MPC-powered asset management",
      initialAPY: 800, // 8% APY in basis points
      riskScore: 15, // Very low risk (MPC security)
      tvl: ethers.parseEther("25000000"), // 25M TVL placeholder
    },
    {
      name: "Somnia Native Staking",
      address: "0x0000000000000000000000000000000000000005", // Placeholder - replace with actual staking contract
      description: "Native SOMI token staking for validator rewards and governance participation",
      initialAPY: 1500, // 15% APY in basis points
      riskScore: 10, // Very low risk (native protocol)
      tvl: ethers.parseEther("100000000"), // 100M TVL placeholder
    },
  ];

  console.log("Adding Somnia DeFi protocols to AI Strategy Manager...");

  for (const protocol of somniaProtocols) {
    try {
      console.log(`Adding ${protocol.name} (${protocol.address})...`);
      
      const tx = await strategyManager.addProtocol(
        protocol.address,
        protocol.name,
        protocol.initialAPY,
        protocol.riskScore,
        protocol.tvl
      );
      
      await tx.wait();
      console.log(`✅ ${protocol.name} added successfully!`);
      console.log(`   APY: ${protocol.initialAPY / 100}%`);
      console.log(`   Risk Score: ${protocol.riskScore}/100`);
      console.log(`   TVL: ${ethers.formatEther(protocol.tvl)} tokens`);
      console.log(`   Description: ${protocol.description}`);
      
    } catch (error) {
      console.error(`❌ Failed to add ${protocol.name}:`, error);
    }
  }

  console.log("\n🎉 Somnia DeFi protocol setup completed!");
  console.log("\nAvailable protocols for AI optimization:");
  console.log("1. Standard Protocol - On-chain CLOB trading (12% APY, Low Risk)");
  console.log("2. QuickSwap - DEX with yield farming (18% APY, Low-Medium Risk)");
  console.log("3. Haifu.fun - AI trading agents (25% APY, Medium-High Risk)");
  console.log("4. Salt Treasury - MPC asset management (8% APY, Very Low Risk)");
  console.log("5. Somnia Native Staking - SOMI staking rewards (15% APY, Very Low Risk)");
  
  console.log("\n📊 AI Strategy Benefits:");
  console.log("- Risk-adjusted portfolio allocation across protocols");
  console.log("- Dynamic rebalancing based on APY changes");
  console.log("- Diversification across different risk levels");
  console.log("- Native Somnia protocol integration");
  
  console.log("\n📝 Next steps:");
  console.log("1. Replace placeholder addresses with actual protocol addresses on Somnia");
  console.log("2. Verify protocol contracts and their interfaces");
  console.log("3. Test AI strategy execution with real protocols");
  console.log("4. Monitor protocol performance and update APY/risk scores");
  console.log("5. Implement protocol-specific integration logic");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
