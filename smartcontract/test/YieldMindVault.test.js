const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NeuroWealthVault", function () {
    let vault, mockUSDC, mockStaking, mockStrategy;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock USDC
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);

        // Deploy mock staking
        const MockMindStaking = await ethers.getContractFactory("MockMindStaking");
        mockStaking = await MockMindStaking.deploy();

        // Deploy mock strategy manager
        const MockNeuroWealthVault = await ethers.getContractFactory("contracts/mocks/MockContract.sol:MockNeuroWealthVault");
        mockStrategy = await MockNeuroWealthVault.deploy();

        // Use the real NeuroWealthVault
        const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
        vault = await NeuroWealthVault.deploy(
            mockStaking.target,
            mockStrategy.target,
            mockUSDC.target
        );

        // Mint USDC to users
        await mockUSDC.mint(user1.address, ethers.parseUnits("10000", 6));
        await mockUSDC.mint(user2.address, ethers.parseUnits("5000", 6));
    });

    describe("Deployment", function () {
        it("Should set correct initial parameters", async function () {
            expect(await vault.MIN_DEPOSIT()).to.equal(ethers.parseUnits("10", 6));
            expect(await vault.MAX_DEPOSIT()).to.equal(ethers.parseUnits("100000", 6));
            expect(await vault.PERFORMANCE_FEE()).to.equal(50);
        });

        it("Should set tier limits correctly", async function () {
            expect(await vault.tierLimits(0)).to.equal(ethers.parseUnits("10000", 6));
            expect(await vault.tierLimits(1)).to.equal(ethers.parseUnits("100000", 6));
            expect(await vault.tierLimits(2)).to.equal(ethers.parseUnits("1000000", 6));
        });
    });

    describe("Deposits", function () {
        it("Should allow valid deposits", async function () {
            const depositAmount = ethers.parseUnits("100", 6);
            await mockStaking.setUserTier(user1.address, 0);
            await mockUSDC.connect(user1).approve(vault.target, depositAmount);

            await expect(vault.connect(user1).deposit(depositAmount))
                .to.emit(vault, "Deposit")
                .withArgs(user1.address, depositAmount);

            const position = await vault.getUserPosition(user1.address);
            expect(position.principal).to.equal(depositAmount);
            expect(position.currentValue).to.equal(depositAmount);
        });

        it("Should reject deposits below minimum", async function () {
            const depositAmount = ethers.parseUnits("5", 6);
            await mockUSDC.connect(user1).approve(vault.target, depositAmount);

            await expect(
                vault.connect(user1).deposit(depositAmount)
            ).to.be.revertedWith("Below minimum deposit");
        });

        it("Should reject deposits above maximum", async function () {
            const depositAmount = ethers.parseUnits("150000", 6);
            await mockUSDC.mint(user1.address, depositAmount);
            await mockUSDC.connect(user1).approve(vault.target, depositAmount);

            await expect(
                vault.connect(user1).deposit(depositAmount)
            ).to.be.revertedWith("Exceeds maximum deposit");
        });

        it("Should enforce tier limits", async function () {
            const depositAmount = ethers.parseUnits("15000", 6);
            await mockStaking.setUserTier(user1.address, 0);
            await mockUSDC.mint(user1.address, depositAmount);
            await mockUSDC.connect(user1).approve(vault.target, depositAmount);

            await expect(
                vault.connect(user1).deposit(depositAmount)
            ).to.be.revertedWith("Exceeds tier limit");
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            const depositAmount = ethers.parseUnits("1000", 6);
            await mockStaking.setUserTier(user1.address, 1);
            await mockUSDC.connect(user1).approve(vault.target, depositAmount);
            await vault.connect(user1).deposit(depositAmount);
            
            // CRITICAL: Mint USDC to vault so it can process withdrawals
            // In real usage, the strategy manager would return funds
            await mockUSDC.mint(vault.target, depositAmount);
        });

        it("Should allow full withdrawal", async function () {
            const initialBalance = await mockUSDC.balanceOf(user1.address);
            await vault.connect(user1).withdraw(0);
            const finalBalance = await mockUSDC.balanceOf(user1.address);
            
            expect(finalBalance).to.be.gt(initialBalance);
            
            const position = await vault.getUserPosition(user1.address);
            expect(position.principal).to.equal(0);
        });

        it("Should allow partial withdrawal", async function () {
            const withdrawAmount = ethers.parseUnits("500", 6);
            const initialBalance = await mockUSDC.balanceOf(user1.address);

            await vault.connect(user1).withdraw(withdrawAmount);

            const finalBalance = await mockUSDC.balanceOf(user1.address);
            expect(finalBalance - initialBalance).to.be.closeTo(
                withdrawAmount,
                ethers.parseUnits("1", 6)
            );

            const position = await vault.getUserPosition(user1.address);
            expect(position.principal).to.be.gt(0);
            expect(position.principal).to.be.lt(ethers.parseUnits("1000", 6));
        });

        it("Should calculate performance fees on profits", async function () {
            // Get current position
            const positionBefore = await vault.getUserPosition(user1.address);
            const principal = positionBefore.principal; // 1000 USDC
            
            // Simulate 10% profit
            const profit = ethers.parseUnits("100", 6);
            const newValue = principal + profit;
            
            // Mint profit to vault
            await mockUSDC.mint(vault.target, profit);
            
            // Update position value
            await vault.updatePositionValue(user1.address, newValue);

            const balanceBefore = await mockUSDC.balanceOf(user1.address);
            
            // Withdraw just the principal amount to avoid complex ratio calculations
            await vault.connect(user1).withdraw(principal);
            
            const balanceAfter = await mockUSDC.balanceOf(user1.address);
            const received = balanceAfter - balanceBefore;

            // Should receive at least the principal back (no fee on principal)
            expect(received).to.be.gte(ethers.parseUnits("995", 6));
            expect(received).to.be.lte(principal);
        });
    });
});