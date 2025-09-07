import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Hybrid Professional YieldMind Setup...");
  console.log("This approach prioritizes real Somnia protocols with professional mocks as fallback");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Existing contract addresses
  const MIND_ADDRESS = "0xcd418b1Cfd4112a04C83943E7584E1E15F8B9B66";
  const MIND_STAKING_ADDRESS = "0x3F615Fd4Ce5E07cC92a17A8c704620a0Bf04f8F3";
  const YIELD_MIND_VAULT_ADDRESS = "0x93Ea984455e5A606AE2ba9CE8A53E3448Ea6deF1";

  // Step 1: Discover Real Somnia Protocols
  console.log("\n🔍 Step 1: Discovering Real Somnia Protocols...");
  
  // For now, we'll use placeholder addresses that should be updated with real discoveries
  const REAL_SOMNIA_PROTOCOLS = {
    // These need to be updated with actual Somnia protocol addresses
    lending: "0x0000000000000000000000000000000000000000", // Update with real address
    dex: "0x0000000000000000000000000000000000000000",     // Update with real address
    staking: "0x0000000000000000000000000000000000000000", // Update with real address
  };

  // Step 2: Deploy SomniaProtocolIntegration
  console.log("\n📦 Step 2: Deploying SomniaProtocolIntegration...");
  const SomniaProtocolIntegration = await ethers.getContractFactory("SomniaProtocolIntegration");
  const protocolIntegration = await SomniaProtocolIntegration.deploy();
  await protocolIntegration.waitForDeployment();
  
  const protocolIntegrationAddress = await protocolIntegration.getAddress();
  console.log("✅ SomniaProtocolIntegration deployed to:", protocolIntegrationAddress);

  // Step 3: Deploy Professional Mock Protocols (as fallback)
  console.log("\n📦 Step 3: Deploying Professional Mock Protocols...");
  const MockSomniaProtocol = await ethers.getContractFactory("MockSomniaProtocol");
  const mockProtocol = await MockSomniaProtocol.deploy();
  await mockProtocol.waitForDeployment();
  
  const mockProtocolAddress = await mockProtocol.getAddress();
  console.log("✅ MockSomniaProtocol deployed to:", mockProtocolAddress);

  // Step 4: Deploy Enhanced AIStrategyManager
  console.log("\n📦 Step 4: Deploying Enhanced AIStrategyManager...");
  const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
  const strategyManager = await AIStrategyManagerV2.deploy(YIELD_MIND_VAULT_ADDRESS);
  await strategyManager.waitForDeployment();
  
  const strategyManagerAddress = await strategyManager.getAddress();
  console.log("✅ AIStrategyManagerV2 deployed to:", strategyManagerAddress);

  // Step 5: Setup Protocol Integration
  console.log("\n🔧 Step 5: Setting up Protocol Integration...");
  const protocolIntegrationContract = await ethers.getContractAt("SomniaProtocolIntegration", protocolIntegrationAddress);
  
  // Add real protocols if available
  let realProtocolCount = 0;
  for (const [type, address] of Object.entries(REAL_SOMNIA_PROTOCOLS)) {
    if (address !== "0x0000000000000000000000000000000000000000") {
      try {
        await protocolIntegrationContract.addProtocol(
          address,
          `Somnia ${type.charAt(0).toUpperCase() + type.slice(1)} Protocol`,
          type,
          true, // Real protocol
          true, // Supports native tokens
          1500, // 15% APY
          30    // Medium risk
        );
        console.log(`✅ Added real Somnia ${type} protocol`);
        realProtocolCount++;
      } catch (error) {
        console.log(`❌ Failed to add real ${type} protocol:`, error.message);
      }
    }
  }
  
  // Add professional mock protocols as fallback
  await protocolIntegrationContract.addProtocol(
    mockProtocolAddress,
    "Professional Mock Somnia Protocol",
    "yield-farm",
    false, // Mock protocol
    true,  // Supports native tokens
    1500, // 15% APY
    30    // Medium risk
  );
  console.log("✅ Added professional mock protocol as fallback");

  // Step 6: Setup Mock Protocol with Multiple Strategies
  console.log("\n🔧 Step 6: Setting up Mock Protocol Strategies...");
  const mockProtocolContract = await ethers.getContractAt("MockSomniaProtocol", mockProtocolAddress);
  
  // Add multiple yield strategies
  await mockProtocolContract.addProtocol(
    ethers.ZeroAddress, // Native STT
    1200, // 12% APY - Conservative
    20    // Low risk
  );
  console.log("✅ Added Conservative Strategy (12% APY, Low Risk)");

  await mockProtocolContract.addProtocol(
    "0x0000000000000000000000000000000000000001", // Mock ERC20
    2000, // 20% APY - Aggressive
    60    // Higher risk
  );
  console.log("✅ Added Aggressive Strategy (20% APY, High Risk)");

  await mockProtocolContract.addProtocol(
    "0x0000000000000000000000000000000000000002", // Mock ERC20
    1600, // 16% APY - Balanced
    40    // Medium risk
  );
  console.log("✅ Added Balanced Strategy (16% APY, Medium Risk)");

  // Step 7: Setup AIStrategyManager with Protocols
  console.log("\n🔧 Step 7: Setting up AIStrategyManager...");
  const strategyManagerContract = await ethers.getContractAt("AIStrategyManagerV2", strategyManagerAddress);
  
  // Add protocol integration to strategy manager
  await strategyManagerContract.addProtocol(
    protocolIntegrationAddress,
    "Somnia Protocol Integration",
    1500, // 15% average APY
    30,   // Average risk
    0,    // Initial TVL
    true  // Supports native tokens
  );
  console.log("✅ Added Protocol Integration to AIStrategyManager");

  // Step 8: Update YieldMindVault
  console.log("\n🔧 Step 8: Updating YieldMindVault...");
  const yieldMindVault = await ethers.getContractAt("YieldMindVault", YIELD_MIND_VAULT_ADDRESS);
  
  try {
    await yieldMindVault.setStrategyManager(strategyManagerAddress);
    console.log("✅ Updated YieldMindVault to use new StrategyManager");
  } catch (error) {
    console.log("❌ Failed to update YieldMindVault:", error.message);
    console.log("Note: You may need to update this manually");
  }

  // Step 9: Test the Hybrid Setup
  console.log("\n🧪 Step 9: Testing Hybrid Setup...");
  
  try {
    // Test protocol discovery
    const allProtocols = await protocolIntegrationContract.getAllProtocols();
    console.log(`✅ Found ${allProtocols.length} protocols configured`);
    
    allProtocols.forEach((protocol, index) => {
      console.log(`   ${index + 1}. ${protocol.name} (${protocol.isRealProtocol ? 'Real' : 'Mock'})`);
    });
    
    // Test mock protocol
    const testAmount = ethers.parseEther("0.1"); // 0.1 STT
    const tx = await mockProtocolContract.deposit(ethers.ZeroAddress, testAmount, {
      value: testAmount
    });
    await tx.wait();
    
    const userBalance = await mockProtocolContract.getBalance(deployer.address, ethers.ZeroAddress);
    console.log("✅ Test deposit successful! Balance:", ethers.formatEther(userBalance), "STT");
    
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }

  // Summary
  console.log("\n📋 Hybrid Professional Setup Summary:");
  console.log("=====================================");
  console.log("SomniaProtocolIntegration:", protocolIntegrationAddress);
  console.log("MockSomniaProtocol:", mockProtocolAddress);
  console.log("AIStrategyManagerV2:", strategyManagerAddress);
  console.log("YieldMindVault:", YIELD_MIND_VAULT_ADDRESS);
  console.log("");
  console.log("Real Protocols Found:", realProtocolCount);
  console.log("Mock Protocols:", 3);
  console.log("Total Strategies:", realProtocolCount + 3);
  console.log("");
  console.log("Features:");
  console.log("✅ Real Somnia protocol integration (when available)");
  console.log("✅ Professional mock protocols (fallback)");
  console.log("✅ Native STT token support");
  console.log("✅ Multi-strategy yield farming");
  console.log("✅ AI-driven portfolio optimization");
  console.log("✅ Risk-adjusted allocation");
  console.log("✅ Professional DeFi architecture");

  // Deployment info
  const deploymentInfo = {
    SomniaProtocolIntegration: protocolIntegrationAddress,
    MockSomniaProtocol: mockProtocolAddress,
    AIStrategyManagerV2: strategyManagerAddress,
    YieldMindVault: YIELD_MIND_VAULT_ADDRESS,
    realProtocolsFound: realProtocolCount,
    mockProtocolsDeployed: 3,
    deployedAt: new Date().toISOString(),
    network: "somniaTestnet",
    approach: "Hybrid - Real protocols prioritized, professional mocks as fallback"
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend with new contract addresses");
  console.log("2. Test the hybrid setup on /deposit-ethers");
  console.log("3. Monitor Somnia ecosystem for new real protocols");
  console.log("4. Update REAL_SOMNIA_PROTOCOLS with actual addresses when found");
  console.log("5. Gradually replace mock protocols with real ones");
  
  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
