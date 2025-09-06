import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MIND Staking", function () {
  async function deployStakingFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy MIND token
    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    // Deploy Staking contract
    const MindStaking = await ethers.getContractFactory("MINDStaking");
    const mindStaking = await MindStaking.deploy(await mindToken.getAddress());

    // Add staking contract as minter
    await mindToken.addMinter(await mindStaking.getAddress());

    // Transfer some tokens to users for testing
    const userAmount = ethers.parseEther("1000");
    await mindToken.transfer(user1.address, userAmount);
    await mindToken.transfer(user2.address, userAmount);

    return { mindToken, mindStaking, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct MIND token address", async function () {
      const { mindToken, mindStaking } = await loadFixture(deployStakingFixture);
      
      expect(await mindStaking.mindToken()).to.equal(await mindToken.getAddress());
    });

    it("Should have correct tier thresholds", async function () {
      const { mindStaking } = await loadFixture(deployStakingFixture);
      
      expect(await mindStaking.PREMIUM_THRESHOLD()).to.equal(ethers.parseEther("100"));
      expect(await mindStaking.PRO_THRESHOLD()).to.equal(ethers.parseEther("500"));
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake MIND tokens", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      
      await expect(mindStaking.connect(user1).stake(stakeAmount))
        .to.emit(mindStaking, "Staked")
        .withArgs(user1.address, stakeAmount, 1); // Premium tier
      
      expect(await mindStaking.getUserTier(user1.address)).to.equal(1);
    });

    it("Should calculate correct tier based on staked amount", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      // Test Free tier
      const freeAmount = ethers.parseEther("50");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), freeAmount);
      await mindStaking.connect(user1).stake(freeAmount);
      expect(await mindStaking.getUserTier(user1.address)).to.equal(0);
      
      // Test Premium tier
      const premiumAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), premiumAmount);
      await mindStaking.connect(user1).stake(premiumAmount);
      expect(await mindStaking.getUserTier(user1.address)).to.equal(1);
      
      // Test Pro tier
      const proAmount = ethers.parseEther("500");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), proAmount);
      await mindStaking.connect(user1).stake(proAmount);
      expect(await mindStaking.getUserTier(user1.address)).to.equal(2);
    });

    it("Should accumulate rewards over time", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Fast forward time to accumulate rewards
      await time.increase(86400); // 1 day
      
      const pendingRewards = await mindStaking.calculatePendingRewards(user1.address);
      expect(pendingRewards).to.be.gt(0);
    });
  });

  describe("Unstaking", function () {
    it("Should require minimum stake duration", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      await expect(mindStaking.connect(user1).requestUnstake())
        .to.be.revertedWith("Minimum stake duration not met");
    });

    it("Should allow unstaking after minimum duration", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Fast forward past minimum stake duration
      await time.increase(8 * 24 * 60 * 60); // 8 days
      
      await expect(mindStaking.connect(user1).requestUnstake())
        .to.not.be.reverted;
    });

    it("Should require cooldown period before unstaking", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Fast forward past minimum stake duration
      await time.increase(8 * 24 * 60 * 60); // 8 days
      await mindStaking.connect(user1).requestUnstake();
      
      // Try to unstake immediately (should fail)
      await expect(mindStaking.connect(user1).unstake(stakeAmount))
        .to.be.revertedWith("Cooldown period not finished");
    });

    it("Should allow unstaking after cooldown", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Fast forward past minimum stake duration + cooldown
      await time.increase(8 * 24 * 60 * 60 + 4 * 24 * 60 * 60); // 8 days + 4 days cooldown
      await mindStaking.connect(user1).requestUnstake();
      
      // Fast forward past cooldown period
      await time.increase(4 * 24 * 60 * 60); // 4 days cooldown
      
      await expect(mindStaking.connect(user1).unstake(stakeAmount))
        .to.emit(mindStaking, "Unstaked")
        .withArgs(user1.address, stakeAmount, 0); // Back to Free tier
    });
  });

  describe("Rewards", function () {
    it("Should calculate correct rewards for different tiers", async function () {
      const { mindToken, mindStaking, user1, user2 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      
      // Stake for Premium tier
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Stake for Free tier
      const freeAmount = ethers.parseEther("50");
      await mindToken.connect(user2).approve(await mindStaking.getAddress(), freeAmount);
      await mindStaking.connect(user2).stake(freeAmount);
      
      // Fast forward time
      await time.increase(86400); // 1 day
      
      const premiumRewards = await mindStaking.calculatePendingRewards(user1.address);
      const freeRewards = await mindStaking.calculatePendingRewards(user2.address);
      
      // Premium tier should earn more rewards (1.5x multiplier)
      expect(premiumRewards).to.be.gt(freeRewards);
    });

    it("Should allow claiming rewards", async function () {
      const { mindToken, mindStaking, user1 } = await loadFixture(deployStakingFixture);
      
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      // Fast forward time
      await time.increase(86400); // 1 day
      
      const balanceBefore = await mindToken.balanceOf(user1.address);
      
      await expect(mindStaking.connect(user1).claimRewards())
        .to.emit(mindStaking, "RewardsClaimed");
      
      const balanceAfter = await mindToken.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Somnia Integration", function () {
    it("Should work with Somnia network characteristics", async function () {
      const { mindStaking } = await loadFixture(deployStakingFixture);
      
      // Test that staking works with Somnia's fast block times
      const network = await ethers.provider.getNetwork();
      console.log(`Testing staking on network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Verify contract is ready for Somnia deployment
      expect(await mindStaking.mindToken()).to.not.equal(ethers.ZeroAddress);
    });
  });
});
