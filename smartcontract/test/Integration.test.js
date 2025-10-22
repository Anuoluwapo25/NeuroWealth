const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NeuroWealth Integration Tests", function () {
    let vault, strategyManager, mindStaking;
    let owner, user1;
    let usdc;

    const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
    const USDC_WHALE = "0x20FE51A9229EEf2cF8Ad9E89d91CAb9312cF3b7A"; // Coinbase wallet with USDC

    before(async function () {
        // Check if we're on the right network
        const chainId = Number((await ethers.provider.getNetwork()).chainId);
        console.log(`Running on chainId: ${chainId}`);

        // Skip if not on Base mainnet fork (8453) or if forking is not enabled
        if (chainId !== 8453) {
            console.log("⚠️  Skipping integration tests - not on Base mainnet fork");
            this.skip();
        }
    });

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Get real USDC contract from Base
        const usdcAbi = [
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)"
        ];
        usdc = await ethers.getContractAt(usdcAbi, USDC_ADDRESS);

        // Deploy mock MIND staking (for testing)
        const MockMINDStaking = await ethers.getContractFactory("MockMINDStaking");
        mindStaking = await MockMINDStaking.deploy();

        // Deploy AI Strategy Manager
        const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
        strategyManager = await AIStrategyManagerV2.deploy(owner.address);

        // Deploy NeuroWealth Vault with REAL USDC address
        const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
        vault = await NeuroWealthVault.deploy(
            await mindStaking.getAddress(),
            await strategyManager.getAddress(),
            USDC_ADDRESS  // Use real USDC
        );

        // Fund user1 with USDC from whale
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [USDC_WHALE],
        });

        const whaleSigner = await ethers.getSigner(USDC_WHALE);

        // Transfer USDC to user1
        const transferAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
        await usdc.connect(whaleSigner).transfer(user1.address, transferAmount);

        await network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [USDC_WHALE],
        });

        // Set user tier to Premium (tier 1)
        await mindStaking.setUserTier(user1.address, 1);

        // Link vault to strategy manager
        await strategyManager.setVault(await vault.getAddress());
    });

    describe("Complete User Journey", function () {
        it("Should allow user to deposit USDC", async function () {
            const depositAmount = ethers.parseUnits("1000", 6); // 1000 USDC

            // Check user has USDC
            const userBalance = await usdc.balanceOf(user1.address);
            expect(userBalance).to.be.gte(depositAmount);

            // Approve vault
            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);

            // Deposit
            await expect(vault.connect(user1).deposit(depositAmount))
                .to.emit(vault, "Deposit")
                .withArgs(user1.address, depositAmount);

            // Check position
            const position = await vault.getUserPosition(user1.address);
            expect(position.principal).to.equal(depositAmount);
        });

        it("Should execute AI strategy selection", async function () {
            const depositAmount = ethers.parseUnits("1000", 6);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount);

            // Verify strategy manager received funds
            const strategyBalance = await usdc.balanceOf(await strategyManager.getAddress());
            expect(strategyBalance).to.equal(depositAmount);
        });

        it("Should handle user withdrawal with performance fees", async function () {
            const depositAmount = ethers.parseUnits("1000", 6);

            // Step 1: User deposits
            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount);

            // Step 2: Simulate profit (update position value)
            const newValue = ethers.parseUnits("1100", 6); // 10% profit
            await vault.updatePositionValue(user1.address, newValue);

            // Step 3: Return USDC to vault from strategy manager
            // Use the whale to fund the vault (simulating strategy returns)
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [USDC_WHALE],
            });

            const whaleSigner = await ethers.getSigner(USDC_WHALE);
            const vaultAddress = await vault.getAddress();

            // Transfer enough USDC to vault for withdrawal
            await usdc.connect(whaleSigner).transfer(vaultAddress, newValue);

            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [USDC_WHALE],
            });

            // Step 4: User withdraws
            const balanceBefore = await usdc.balanceOf(user1.address);
            await vault.connect(user1).withdraw(0);
            const balanceAfter = await usdc.balanceOf(user1.address);

            const received = balanceAfter - balanceBefore;

            // Calculate expected values
            const profit = newValue - depositAmount; // 100 USDC
            const expectedFee = (profit * 50n) / 10000n; // 0.5% of profit = 0.5 USDC
            const expectedReceived = newValue - expectedFee; // 1099.5 USDC

            console.log("Deposited:", ethers.formatUnits(depositAmount, 6), "USDC");
            console.log("Position value:", ethers.formatUnits(newValue, 6), "USDC");
            console.log("Profit:", ethers.formatUnits(profit, 6), "USDC");
            console.log("Fee (0.5% of profit):", ethers.formatUnits(expectedFee, 6), "USDC");
            console.log("Expected received:", ethers.formatUnits(expectedReceived, 6), "USDC");
            console.log("Actually received:", ethers.formatUnits(received, 6), "USDC");

            // Verify the amounts
            expect(received).to.equal(expectedReceived);
            expect(received).to.be.lt(newValue); // Less than total value
            expect(received).to.be.gt(depositAmount); // More than deposit
        });
    });

    describe("Error Handling", function () {
        it("Should handle insufficient balance gracefully", async function () {
            // User only has 10,000 USDC (9,000 after previous tests if run in sequence)
            const userBalance = await usdc.balanceOf(user1.address);
            const hugeAmount = userBalance + ethers.parseUnits("1000", 6); // More than balance

            await usdc.connect(user1).approve(await vault.getAddress(), hugeAmount);

            // Will fail due to insufficient USDC balance
            await expect(
                vault.connect(user1).deposit(hugeAmount)
            ).to.be.reverted;
        });

        it("Should enforce maximum deposit limit", async function () {
            const maxExceeding = ethers.parseUnits("150000", 6); // Exceeds MAX_DEPOSIT (100k)

            // Fund user with enough USDC
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [USDC_WHALE],
            });
            const whaleSigner = await ethers.getSigner(USDC_WHALE);
            await usdc.connect(whaleSigner).transfer(user1.address, maxExceeding);
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [USDC_WHALE],
            });

            await usdc.connect(user1).approve(await vault.getAddress(), maxExceeding);

            await expect(
                vault.connect(user1).deposit(maxExceeding)
            ).to.be.revertedWith("Exceeds maximum deposit");
        });

        it("Should enforce tier limits", async function () {
            const tierExceeding = ethers.parseUnits("50000", 6); // Within max but exceeds tier 1 limit

            // Deposit twice to exceed tier limit
            await usdc.connect(user1).approve(await vault.getAddress(), tierExceeding * 2n);

            await vault.connect(user1).deposit(tierExceeding);

            // Second deposit should fail tier limit
            await expect(
                vault.connect(user1).deposit(tierExceeding + ethers.parseUnits("1", 6))
            ).to.be.revertedWith("Exceeds tier limit");
        });
    });
});