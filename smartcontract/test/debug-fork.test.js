const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fork Debug Test", function () {
    it("Should show network information", async function () {
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        const blockNumber = await ethers.provider.getBlockNumber();
        
        console.log("\n=================================");
        console.log("Network Debug Information:");
        console.log("=================================");
        console.log("Chain ID:", chainId);
        console.log("Block Number:", blockNumber);
        console.log("Network Name:", network.name);
        console.log("=================================\n");
        
        // Check if we're on Base mainnet fork
        if (chainId === 8453) {
            console.log("✅ Successfully forked Base mainnet!");
            
            // Try to get USDC contract
            const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
            const usdcAbi = ["function symbol() view returns (string)"];
            const usdc = await ethers.getContractAt(usdcAbi, USDC_ADDRESS);
            
            try {
                const symbol = await usdc.symbol();
                console.log("✅ USDC contract accessible, symbol:", symbol);
            } catch (error) {
                console.log("❌ Could not access USDC contract:", error.message);
            }
        } else {
            console.log("❌ Not on Base mainnet fork (expected chainId: 8453)");
        }
        
        expect(chainId).to.equal(8453);
    });
});