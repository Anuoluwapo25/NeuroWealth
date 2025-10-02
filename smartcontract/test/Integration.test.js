const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NeuroWealth Integration Tests", function () {
    let mindToken, vault, strategyManager, aeroAdapter, staking;
    let mockUSDC;
    let owner, user1, user2;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy all contracts in correct order
        const MIND = await ethers.getContractFactory("MIND");
        mindToken = await MIND.deploy();

        const MINDStaking = await ethers.getContractFactory("MINDStaking");
        staking = await MINDStaking.deploy(mindToken.target);

        // Deploy mock USDC for testing FIRST
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);

        // Deploy strategy manager with temporary mock vault
        const MockNeuroWealthVault = await ethers.getContractFactory("contracts/mocks/MockContract.sol:MockNeuroWealthVault");
        const mockVault = await MockNeuroWealthVault.deploy();
        
        const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
        strategyManager = await AIStrategyManagerV2.deploy(mockVault.target);
        
        // Set USDC address in strategy manager
        await strategyManager.setUSDC(mockUSDC.target);

        // Deploy REAL NeuroWealth Vault
        const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
        vault = await NeuroWealthVault.deploy(
            staking.target, 
            strategyManager.target,
            mockUSDC.target
        );

        // IMPORTANT: Update the vault address in strategy manager to the REAL vault
        await strategyManager.setVault(vault.target);

        const AerodromeAdapter = await ethers.getContractFactory("MockAerodromeStrategyAdapter");
        aeroAdapter = await AerodromeAdapter.deploy(strategyManager.target);

        // Setup initial state
        await mindToken.addMinter(staking.target);
        await strategyManager.addMockProtocol(
            aeroAdapter.target,
            "Aerodrome Finance USDC/WETH",
            800,  // 8% APY
            25    // Risk score
        );

        // Mint test tokens
        await mockUSDC.mint(user1.address, ethers.parseUnits("100000", 6));
        await mockUSDC.mint(user2.address, ethers.parseUnits("100000", 6));
        await mindToken.transfer(user1.address, ethers.parseEther("1000"));
        await mindToken.transfer(user2.address, ethers.parseEther("1000"));
    });

    describe("Complete User Journey", function () {
        it("Should allow user to stake MIND and get tier benefits", async function () {
            // User stakes MIND for Premium tier
            const stakeAmount = ethers.parseEther("100");
            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            expect(await staking.getUserTier(user1.address)).to.equal(1); // Premium
        });

        it("Should allow user to deposit USDC with tier benefits", async function () {
            const depositAmount = ethers.parseUnits("5000", 6); // 5k USDC

            await mockUSDC.connect(user1).approve(vault.target, depositAmount);

            // This should work because user has Premium tier (100k limit)
            await expect(vault.connect(user1).deposit(depositAmount))
                .to.emit(vault, "Deposit")
                .withArgs(user1.address, depositAmount);

            // Check position was created
            const position = await vault.getUserPosition(user1.address);
            expect(position[0]).to.equal(depositAmount); // principal
            expect(position[3]).to.equal(1); // Premium tier
        });

        it("Should execute AI strategy selection", async function () {
            const depositAmount = ethers.parseUnits("1000", 6);

            await mockUSDC.connect(user2).approve(vault.target, depositAmount);

            // This should trigger strategy execution
            await vault.connect(user2).deposit(depositAmount);
        });

        it("Should handle user withdrawal with performance fees", async function () {
            // Get user's current position
            const position = await vault.getUserPosition(user1.address);
            const currentPrincipal = position[0]; // This is 5000 USDC from the deposit test
            
            // Simulate profits: 10% gain = 500 USDC profit
            const profitAmount = ethers.parseUnits("500", 6);
            const newValue = currentPrincipal + profitAmount;
            
            // Mint the full amount needed to vault (principal + profit)
            await mockUSDC.mint(vault.target, newValue);
            
            // Update position value
            await vault.updatePositionValue(user1.address, newValue);
            
            const initialBalance = await mockUSDC.balanceOf(user1.address);
            
            // Withdraw everything
            await vault.connect(user1).withdraw(newValue);
            
            const finalBalance = await mockUSDC.balanceOf(user1.address);
            const received = finalBalance - initialBalance;

            // Should receive principal + profit minus 0.5% fee on profit
            // Fee = 500 * 0.005 = 2.5 USDC
            // Expected: 5000 + 497.5 = 5497.5 USDC
            expect(received).to.be.gte(ethers.parseUnits("5490", 6));
        });
    });

    describe("Error Handling", function () {
        it("Should prevent Free tier users from exceeding limits", async function () {
            const largeAmount = ethers.parseUnits("15000", 6); // 15k USDC

            await mockUSDC.mint(user2.address, largeAmount);
            await mockUSDC.connect(user2).approve(vault.target, largeAmount);

            // user2 is Free tier (10k limit)
            await expect(
                vault.connect(user2).deposit(largeAmount)
            ).to.be.revertedWith("Exceeds tier limit");
        });

        it("Should handle insufficient balance gracefully", async function () {
            // user2 has a position from previous test, try to withdraw more
            const position = await vault.getUserPosition(user2.address);
            const tooMuch = position[0] + ethers.parseUnits("1000", 6); // More than deposited
            
            await expect(
                vault.connect(user2).withdraw(tooMuch)
            ).to.be.reverted;
        });
    });
});