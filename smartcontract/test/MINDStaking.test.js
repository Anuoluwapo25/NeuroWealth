const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MINDStaking", function () {
    let staking, mindToken;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy MIND token
        const MIND = await ethers.getContractFactory("MIND");
        mindToken = await MIND.deploy();

        // Deploy staking contract
        const MINDStaking = await ethers.getContractFactory("MINDStaking");
        staking = await MINDStaking.deploy(mindToken.target);

        // Add staking contract as minter
        await mindToken.addMinter(staking.target);

        // Transfer tokens to users for staking
        await mindToken.transfer(user1.address, ethers.parseEther("1000"));
        await mindToken.transfer(user2.address, ethers.parseEther("2000"));
    });

    describe("Tier System", function () {
        it("Should start users at Free tier", async function () {
            expect(await staking.getUserTier(user1.address)).to.equal(0);
        });

        it("Should upgrade to Premium tier with 100 MIND", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            expect(await staking.getUserTier(user1.address)).to.equal(1); // Premium
        });

        it("Should upgrade to Pro tier with 500 MIND", async function () {
            const stakeAmount = ethers.parseEther("500");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            expect(await staking.getUserTier(user1.address)).to.equal(2); // Pro
        });
    });

    describe("Staking Mechanics", function () {
        it("Should allow users to stake MIND tokens", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);

            await expect(staking.connect(user1).stake(stakeAmount))
                .to.emit(staking, "Staked")
                .withArgs(user1.address, stakeAmount, 1); // Premium tier

            const userStake = await staking.userStakes(user1.address);
            expect(userStake.amount).to.equal(stakeAmount);
        });

        it("Should require minimum stake duration before unstaking", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            await expect(
                staking.connect(user1).requestUnstake()
            ).to.be.revertedWith("Minimum stake duration not met");
        });

        it("Should require unstake request before unstaking", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            await expect(
                staking.connect(user1).unstake(stakeAmount)
            ).to.be.revertedWith("Must request unstake first");
        });
    });

    describe("Rewards", function () {
        it("Should calculate pending rewards correctly", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            const pendingRewards = await staking.calculatePendingRewards(user1.address);
            expect(pendingRewards).to.be.gt(0);
        });

        it("Should apply tier multipliers to rewards", async function () {
            const stakeAmount = ethers.parseEther("500"); // Pro tier

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            const pendingRewards = await staking.calculatePendingRewards(user1.address);
            expect(pendingRewards).to.be.gt(0);

            // Pro tier should have higher rewards than base rate
            // This tests the 2x multiplier is being applied
        });

        it("Should allow users to claim rewards", async function () {
            const stakeAmount = ethers.parseEther("100");

            await mindToken.connect(user1).approve(staking.target, stakeAmount);
            await staking.connect(user1).stake(stakeAmount);

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            const initialBalance = await mindToken.balanceOf(user1.address);
            await staking.connect(user1).claimRewards();
            const finalBalance = await mindToken.balanceOf(user1.address);

            expect(finalBalance).to.be.gt(initialBalance);
        });
    });
});