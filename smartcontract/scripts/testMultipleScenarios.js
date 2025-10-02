const { ethers, network } = require("hardhat");

async function main() {
  console.log("Testing multiple scenarios on fork...\n");

  // Scenario 1: Test with different deposit amounts
  console.log("=== Scenario 1: Small deposit ===");
  await testDeposit(ethers.parseUnits("50", 6));
  
  // Reset fork
  await network.provider.request({
    method: "hardhat_reset",
    params: [{
      forking: {
        url: process.env.BASE_MAINNET_RPC,
        blockNumber: 10000000
      }
    }]
  });

  // Scenario 2: Test with large deposit
  console.log("\n=== Scenario 2: Large deposit ===");
  await testDeposit(ethers.parseUnits("5000", 6));
}

async function testDeposit(amount) {
  // Your testing logic here
  console.log("Testing with", ethers.formatUnits(amount, 6), "USDC");
}

main();