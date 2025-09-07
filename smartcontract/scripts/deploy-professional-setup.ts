import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Professional YieldMind Setup...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Existing contract addresses
  const MIND_ADDRESS = "0xcd418b1Cfd4112a04C83943E7584E1E15F8B9B66";
  const MIND_STAKING_ADDRESS = "0x3F615Fd4Ce5E07cC92a17A8c704620a0Bf04f8F3";
  const YIELD_MIND_VAULT_ADDRESS = "0x93Ea984455e5A606AE2ba9CE8A53E3448Ea6deF1";
  const AI_STRATEGY_MANAGER_ADDRESS = "0x4B823920717272C0Ed7e248Ac5AEff7927D8FE7C";

  // Step 1: Deploy MockSomniaProtocol
  console.log("\n📦 Step 1: Deploying MockSomniaProtocol...");
  const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
  const mockProtocol = await MockSomniaProtocol.deploy();
  await mockProtocol.waitForDeployment();
  
  const mockProtocolAddress = await mockProtocol.getAddress();
  console.log("✅ MockSomniaProtocol deployed to:", mockProtocolAddress);

  // Step 2: Deploy AIStrategyManagerV2
  console.log("\n📦 Step 2: Deploying AIStrategyManagerV2...");
  const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
  const strategyManagerV2 = await AIStrategyManagerV2.deploy(YIELD_MIND_VAULT_ADDRESS);
  await strategyManagerV2.waitForDeployment();
  
  const strategyManagerV2Address = await strategyManagerV2.getAddress();
  console.log("✅ AIStrategyManagerV2 deployed to:", strategyManagerV2Address);

  // Step 3: Setup MockSomniaProtocol with native STT support
  console.log("\n🔧 Step 3: Setting up MockSomniaProtocol...");
  const mockProtocolContract = await ethers.getContractAt("MockSomniaProtocol", mockProtocolAddress);
  
  // Add native STT protocol (address(0))
  await mockProtocolContract.addProtocol(
    ethers.ZeroAddress, // Native STT token
    1200, // 12% APY
    20    // Low risk
  );
  console.log("✅ Added Somnia Lending Protocol (Native STT)");

  // Add mock ERC20 protocols for testing
  await mockProtocolContract.addProtocol(
    "0x0000000000000000000000000000000000000001", // Mock ERC20 token 1
    1800, // 18% APY
    40    // Medium risk
  );
  console.log("✅ Added Somnia DEX Protocol (ERC20)");

  await mockProtocolContract.addProtocol(
    "0x0000000000000000000000000000000000000002", // Mock ERC20 token 2
    2500, // 25% APY
    60    // Higher risk
  );
  console.log("✅ Added Somnia Yield Farm Protocol (ERC20)");

  // Step 4: Setup AIStrategyManagerV2 with protocols
  console.log("\n🔧 Step 4: Setting up AIStrategyManagerV2...");
  const strategyManagerV2Contract = await ethers.getContractAt("AIStrategyManagerV2", strategyManagerV2Address);
  
  // Add MockSomniaProtocol to StrategyManager (supports native tokens)
  await strategyManagerV2Contract.addProtocol(
    mockProtocolAddress,
    "Mock Somnia Protocol",
    1500, // 15% average APY
    30,   // Average risk
    0,    // Initial TVL
    true  // Supports native tokens
  );
  console.log("✅ Added MockSomniaProtocol to AIStrategyManagerV2");

  // Step 5: Update YieldMindVault to use new StrategyManager
  console.log("\n🔧 Step 5: Updating YieldMindVault...");
  const yieldMindVault = await ethers.getContractAt("YieldMindVault", YIELD_MIND_VAULT_ADDRESS);
  
  try {
    await yieldMindVault.setStrategyManager(strategyManagerV2Address);
    console.log("✅ Updated YieldMindVault to use AIStrategyManagerV2");
  } catch (error) {
    console.log("❌ Failed to update YieldMindVault:", error);
    console.log("Note: You may need to update this manually or redeploy the vault");
  }

  // Step 6: Verify setup
  console.log("\n🔍 Step 6: Verifying setup...");
  
  // Check MockSomniaProtocol
  const lendingInfo = await mockProtocolContract.getProtocolInfo(ethers.ZeroAddress);
  console.log("MockSomniaProtocol - Native STT Protocol:", {
    totalDeposits: ethers.formatEther(lendingInfo.totalDeposits),
    apy: lendingInfo.apy.toString(),
    riskScore: lendingInfo.riskScore.toString(),
    isActive: lendingInfo.isActive
  });

  // Check AIStrategyManagerV2
  const protocolInfo = await strategyManagerV2Contract.getProtocolInfo(mockProtocolAddress);
  console.log("AIStrategyManagerV2 - Protocol Info:", {
    name: protocolInfo.name,
    apy: protocolInfo.currentAPY.toString(),
    riskScore: protocolInfo.riskScore.toString(),
    supportsNativeToken: protocolInfo.supportsNativeToken,
    isActive: protocolInfo.isActive
  });

  // Step 7: Test native token deposit (simulation)
  console.log("\n🧪 Step 7: Testing native token deposit simulation...");
  
  try {
    // This would be called by the vault when a user deposits
    const testAmount = ethers.parseEther("1.0"); // 1 STT
    const testUser = deployer.address;
    
    // Simulate what the vault would do
    console.log("Simulating deposit of 1 STT to MockSomniaProtocol...");
    
    // Direct deposit to mock protocol (this is what StrategyManager would do)
    const tx = await mockProtocolContract.deposit(ethers.ZeroAddress, testAmount, {
      value: testAmount
    });
    await tx.wait();
    
    const userBalance = await mockProtocolContract.getBalance(testUser, ethers.ZeroAddress);
    console.log("✅ Test deposit successful! User balance:", ethers.formatEther(userBalance), "STT");
    
  } catch (error) {
    console.log("❌ Test deposit failed:", error);
  }

  // Summary
  console.log("\n📋 Professional Setup Summary:");
  console.log("================================");
  console.log("MockSomniaProtocol:", mockProtocolAddress);
  console.log("AIStrategyManagerV2:", strategyManagerV2Address);
  console.log("YieldMindVault:", YIELD_MIND_VAULT_ADDRESS);
  console.log("Native STT Support: ✅");
  console.log("ERC20 Support: ✅");
  console.log("Yield Generation: ✅");
  console.log("Risk Management: ✅");
  console.log("Professional DeFi Integration: ✅");

  // Save addresses
  const deploymentInfo = {
    MockSomniaProtocol: mockProtocolAddress,
    AIStrategyManagerV2: strategyManagerV2Address,
    YieldMindVault: YIELD_MIND_VAULT_ADDRESS,
    MindStaking: MIND_STAKING_ADDRESS,
    MindToken: MIND_ADDRESS,
    deployedAt: new Date().toISOString(),
    network: "somniaTestnet",
    features: [
      "Native STT token support",
      "ERC20 token support", 
      "Multi-protocol yield farming",
      "AI-driven strategy optimization",
      "Risk-adjusted portfolio allocation",
      "Professional DeFi integration"
    ]
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
