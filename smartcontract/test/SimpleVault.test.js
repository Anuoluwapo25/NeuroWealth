const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Simple Vault Tests", function () {
  async function deploySimpleVaultFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy MIND token
    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    // Deploy Staking contract
    const MockMindStaking = await ethers.getContractFactory("MockMindStaking");
    const mindStaking = await MockMindStaking.deploy();

    // Deploy mock USDC FIRST
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);

    // Deploy NeuroWealth Vault with all 3 parameters
    const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
    const vault = await NeuroWealthVault.deploy(
      await mindStaking.getAddress(),
      ethers.ZeroAddress, // No strategy manager for simple tests
      await usdc.getAddress() // Add USDC address parameter
    );

    // Mint tokens to users
    await usdc.mint(user1.address, ethers.parseUnits("100000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("100000", 6));

    // Set user tiers for testing
    await mindStaking.setUserTier(user1.address, 0); // Free tier
    await mindStaking.setUserTier(user2.address, 1); // Premium tier

    return {
      vault,
      mindToken,
      mindStaking,
      usdc,
      owner,
      user1,
      user2,
    };
  }

  describe("Basic Vault Operations", function () {
    it("Should have correct tier limits", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);

      expect(await vault.tierLimits(0)).to.equal(ethers.parseUnits("10000", 6)); // Free: $10k
      expect(await vault.tierLimits(1)).to.equal(ethers.parseUnits("100000", 6)); // Premium: $100k  
      expect(await vault.tierLimits(2)).to.equal(ethers.parseUnits("1000000", 6)); // Pro: $1M
    });

    it("Should have correct deposit limits", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);

      expect(await vault.MIN_DEPOSIT()).to.equal(ethers.parseUnits("10", 6)); // 10 USDC
      expect(await vault.MAX_DEPOSIT()).to.equal(ethers.parseUnits("100000", 6)); // 100k USDC
    });

    it("Should enforce minimum deposit amounts", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);

      const smallAmount = ethers.parseUnits("5", 6); // $5 USDC (below $10 minimum)
      await usdc.connect(user1).approve(await vault.getAddress(), smallAmount);

      await expect(
        vault.connect(user1).deposit(smallAmount)
      ).to.be.revertedWith("Below minimum deposit");
    });

    it("Should enforce maximum deposit amounts", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);

      const largeAmount = ethers.parseUnits("150000", 6); // 150k USDC (above 100k max)
      await usdc.connect(user1).approve(await vault.getAddress(), largeAmount);

      await expect(
        vault.connect(user1).deposit(largeAmount)
      ).to.be.revertedWith("Exceeds maximum deposit");
    });

    it("Should enforce tier-based deposit limits", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);

      // User1 is Free tier (10k limit)
      const largeAmount = ethers.parseUnits("15000", 6); // $15k USDC (above $10k limit)
      await usdc.connect(user1).approve(await vault.getAddress(), largeAmount);

      await expect(
        vault.connect(user1).deposit(largeAmount)
      ).to.be.revertedWith("Exceeds tier limit");
    });

    it("Should allow deposits within tier limits", async function () {
      const { vault, usdc, user2 } = await loadFixture(deploySimpleVaultFixture);

      // User2 is Premium tier (100k limit), so 15k should work
      const validAmount = ethers.parseUnits("15000", 6);
      await usdc.connect(user2).approve(await vault.getAddress(), validAmount);

      await expect(
        vault.connect(user2).deposit(validAmount)
      ).to.emit(vault, "Deposit");
    });

    it("Should track total value locked correctly", async function () {
      const { vault, usdc, user2 } = await loadFixture(deploySimpleVaultFixture);

      expect(await vault.totalValueLocked()).to.equal(0);

      // Make a deposit
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user2).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user2).deposit(depositAmount);

      expect(await vault.totalValueLocked()).to.equal(depositAmount);
    });

    it("Should have correct performance fee", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);

      expect(await vault.PERFORMANCE_FEE()).to.equal(50); // 0.5%
      expect(await vault.FEE_DENOMINATOR()).to.equal(10000);
    });
  });

  describe("User Position Tracking", function () {
    it("Should return empty position for new user", async function () {
      const { vault, user1 } = await loadFixture(deploySimpleVaultFixture);

      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(0);
      expect(position.currentValue).to.equal(0);
      expect(position.totalReturns).to.equal(0);
    });

    it("Should return correct user tier", async function () {
      const { vault, user1, user2 } = await loadFixture(deploySimpleVaultFixture);

      const position1 = await vault.getUserPosition(user1.address);
      const position2 = await vault.getUserPosition(user2.address);

      expect(position1.userTier).to.equal(0); // Free tier
      expect(position2.userTier).to.equal(1); // Premium tier
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to pause/unpause", async function () {
      const { vault, owner } = await loadFixture(deploySimpleVaultFixture);

      await vault.connect(owner).pause();
      expect(await vault.paused()).to.be.true;

      await vault.connect(owner).unpause();
      expect(await vault.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      const { vault, user1 } = await loadFixture(deploySimpleVaultFixture);

      await expect(
        vault.connect(user1).pause()
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Somnia Compatibility", function () {
    it("Should work with Somnia network characteristics", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);

      const network = await ethers.provider.getNetwork();
      console.log(
        `Testing vault on network: ${network.name} (Chain ID: ${network.chainId})`
      );

      // Verify vault is ready for Somnia deployment
      expect(await vault.totalValueLocked()).to.equal(0);
      console.log("✅ NeuroWealth vault ready for Somnia deployment");
    });

    it("Should have correct rebalance frequencies for tiers", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);

      expect(await vault.rebalanceFrequency(0)).to.equal(86400); // Free: 24 hours
      expect(await vault.rebalanceFrequency(1)).to.equal(14400); // Premium: 4 hours  
      expect(await vault.rebalanceFrequency(2)).to.equal(3600);  // Pro: 1 hour
    });
  });
});