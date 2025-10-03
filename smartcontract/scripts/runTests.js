const { expect } = require("chai");
const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Running NeuroWealth Test Suite");
    console.log("================================");

    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    const tests = [
        { name: "MIND Token Tests", file: "test/MIND.test.js" },
        { name: "NeuroWealthVault Tests", file: "test/YieldMindVault.test.js" },
        { name: "AIStrategyManagerV2 Tests", file: "test/AIStrategyManagerV2.test.js" },
        { name: "AerodromeStrategyAdapter Tests", file: "test/AerodromeStrategyAdapter.test.js" },
        { name: "MINDStaking Tests", file: "test/MINDStaking.test.js" },
        { name: "Integration Tests", file: "test/Integration.test.js" }
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const test of tests) {
        console.log(`\n📋 Running ${test.name}...`);

        try {
            const { stdout, stderr } = await execPromise(`npx hardhat test ${test.file}`);

            // Parse test results
            const passMatch = stdout.match(/(\d+) passing/);
            const failMatch = stdout.match(/(\d+) failing/);

            const passed = passMatch ? parseInt(passMatch[1]) : 0;
            const failed = failMatch ? parseInt(failMatch[1]) : 0;

            totalTests += passed + failed;
            passedTests += passed;
            failedTests += failed;

            if (failed === 0) {
                console.log(`✅ ${test.name}: ${passed} tests passed`);
            } else {
                console.log(`❌ ${test.name}: ${passed} passed, ${failed} failed`);
                console.log(stderr);
            }

        } catch (error) {
            console.log(`💥 ${test.name}: Error running tests`);
            console.log(error.message);
            failedTests++;
        }
    }

    console.log("\n📊 Test Summary");
    console.log("================");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log("\n🎉 All tests passed! Ready for deployment.");
    } else {
        console.log("\n⚠️  Some tests failed. Review and fix before deployment.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
