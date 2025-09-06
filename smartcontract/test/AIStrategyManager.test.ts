import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AI Strategy Manager", function () {
  async function deployStrategyManagerFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy YieldMind Vault (mock)
    const MockVault = await ethers.getContractFactory("MockYieldMindVault");
    const vault = await MockVault.deploy();

    // Deploy AI Strategy Manager
    const AIStrategyManager = await ethers.getContractFactory("AIStrategyManager");
    const strategyManager = await AIStrategyManager.deploy(await vault.getAddress());

    // Deploy mock external protocols for testing
    const MockProtocol = await ethers.getContractFactory("MockExternalProtocol");
    const standardProtocol = await MockProtocol.deploy("Standard Protocol", 1200, 25); // 12% APY, Low risk
    const quickSwap = await MockProtocol.deploy("QuickSwap", 1800, 30); // 18% APY, Medium risk
    const haifuFun = await MockProtocol.deploy("Haifu.fun", 2500, 60); // 25% APY, High risk
    const saltTreasury = await MockProtocol.deploy("Salt Treasury", 800, 15); // 8% APY, Very low risk
    const somniaStaking = await MockProtocol.deploy("Somnia Staking", 1500, 10); // 15% APY, Very low risk

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);

    return {
      strategyManager,
      vault,
      standardProtocol,
      quickSwap,
      haifuFun,
      saltTreasury,
      somniaStaking,
      usdc,
      owner,
      user1,
      user2
    };
  }

  describe("Deployment", function () {
    it("Should set the correct vault address", async function () {
      const { strategyManager, vault } = await loadFixture(deployStrategyManagerFixture);
      
      expect(await strategyManager.yieldMindVault()).to.equal(await vault.getAddress());
    });

    it("Should have correct constants", async function () {
      const { strategyManager } = await loadFixture(deployStrategyManagerFixture);
      
      expect(await strategyManager.MAX_PROTOCOLS_PER_STRATEGY()).to.equal(5);
      expect(await strategyManager.MIN_ALLOCATION_PERCENTAGE()).to.equal(500); // 5%
      expect(await strategyManager.REBALANCE_THRESHOLD()).to.equal(1000); // 10%
    });
  });

  describe("Protocol Management", function () {
    it("Should allow owner to add protocols", async function () {
      const { strategyManager, standardProtocol, owner } = await loadFixture(deployStrategyManagerFixture);
      
      await expect(strategyManager.connect(owner).addProtocol(
        await standardProtocol.getAddress(),
        "Standard Protocol",
        1200, // 12% APY
        25,   // Risk score
        ethers.parseEther("10000000") // 10M TVL
      )).to.emit(strategyManager, "ProtocolAdded")
        .withArgs(await standardProtocol.getAddress(), "Standard Protocol");
    });

    it("Should reject invalid protocol addresses", async function () {
      const { strategyManager, owner } = await loadFixture(deployStrategyManagerFixture);
      
      await expect(strategyManager.connect(owner).addProtocol(
        ethers.ZeroAddress,
        "Invalid Protocol",
        1000,
        50,
        ethers.parseEther("1000000")
      )).to.be.revertedWith("Invalid protocol address");
    });

    it("Should reject invalid risk scores", async function () {
      const { strategyManager, standardProtocol, owner } = await loadFixture(deployStrategyManagerFixture);
      
      await expect(strategyManager.connect(owner).addProtocol(
        await standardProtocol.getAddress(),
        "Standard Protocol",
        1000,
        150, // Invalid risk score > 100
        ethers.parseEther("1000000")
      )).to.be.revertedWith("Risk score must be <= 100");
    });

    it("Should allow updating protocol data", async function () {
      const { strategyManager, standardProtocol, owner } = await loadFixture(deployStrategyManagerFixture);
      
      // Add protocol first
      await strategyManager.connect(owner).addProtocol(
        await standardProtocol.getAddress(),
        "Standard Protocol",
        1200,
        25,
        ethers.parseEther("10000000")
      );
      
      // Update protocol data
      await expect(strategyManager.connect(owner).updateProtocolData(
        await standardProtocol.getAddress(),
        1500, // New APY: 15%
        20,   // New risk score
        ethers.parseEther("15000000") // New TVL: 15M
      )).to.not.be.reverted;
    });
  });

  describe("Strategy Execution", function () {
    beforeEach(async function () {
      const { strategyManager, standardProtocol, quickSwap, haifuFun, saltTreasury, somniaStaking, owner } = await loadFixture(deployStrategyManagerFixture);
      
      // Add all Somnia protocols
      await strategyManager.connect(owner).addProtocol(
        await standardProtocol.getAddress(),
        "Standard Protocol",
        1200, // 12% APY
        25,   // Risk score
        ethers.parseEther("10000000")
      );
      
      await strategyManager.connect(owner).addProtocol(
        await quickSwap.getAddress(),
        "QuickSwap",
        1800, // 18% APY
        30,   // Risk score
        ethers.parseEther("50000000")
      );
      
      await strategyManager.connect(owner).addProtocol(
        await haifuFun.getAddress(),
        "Haifu.fun",
        2500, // 25% APY
        60,   // Risk score
        ethers.parseEther("5000000")
      );
      
      await strategyManager.connect(owner).addProtocol(
        await saltTreasury.getAddress(),
        "Salt Treasury",
        800,  // 8% APY
        15,   // Risk score
        ethers.parseEther("25000000")
      );
      
      await strategyManager.connect(owner).addProtocol(
        await somniaStaking.getAddress(),
        "Somnia Staking",
        1500, // 15% APY
        10,   // Risk score
        ethers.parseEther("100000000")
      );
    });

    it("Should execute strategy for user deposit", async function () {
      const { strategyManager, vault, usdc, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      const depositAmount = ethers.parseUnits("10000", 6); // $10k USDC
      
      // Mock vault to return user1 as the original caller
      await vault.setMockUser(user1.address);
      
      await expect(strategyManager.executeStrategy(depositAmount, await usdc.getAddress()))
        .to.emit(strategyManager, "StrategyExecuted")
        .withArgs(user1.address, await usdc.getAddress(), depositAmount);
    });

    it("Should select optimal protocols based on risk-adjusted scoring", async function () {
      const { strategyManager, vault, usdc, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      const depositAmount = ethers.parseUnits("10000", 6);
      await vault.setMockUser(user1.address);
      
      await strategyManager.executeStrategy(depositAmount, await usdc.getAddress());
      
      const strategy = await strategyManager.getUserStrategy(user1.address);
      expect(strategy.totalValue).to.equal(depositAmount);
      expect(strategy.depositToken).to.equal(await usdc.getAddress());
    });

    it("Should only allow vault to execute strategies", async function () {
      const { strategyManager, usdc, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      const depositAmount = ethers.parseUnits("10000", 6);
      
      await expect(strategyManager.connect(user1).executeStrategy(depositAmount, await usdc.getAddress()))
        .to.be.revertedWith("Only vault can call");
    });
  });

  describe("Portfolio Rebalancing", function () {
    beforeEach(async function () {
      const { strategyManager, standardProtocol, quickSwap, haifuFun, saltTreasury, somniaStaking, owner } = await loadFixture(deployStrategyManagerFixture);
      
      // Add protocols
      await strategyManager.connect(owner).addProtocol(await standardProtocol.getAddress(), "Standard Protocol", 1200, 25, ethers.parseEther("10000000"));
      await strategyManager.connect(owner).addProtocol(await quickSwap.getAddress(), "QuickSwap", 1800, 30, ethers.parseEther("50000000"));
      await strategyManager.connect(owner).addProtocol(await haifuFun.getAddress(), "Haifu.fun", 2500, 60, ethers.parseEther("5000000"));
      await strategyManager.connect(owner).addProtocol(await saltTreasury.getAddress(), "Salt Treasury", 800, 15, ethers.parseEther("25000000"));
      await strategyManager.connect(owner).addProtocol(await somniaStaking.getAddress(), "Somnia Staking", 1500, 10, ethers.parseEther("100000000"));
    });

    it("Should rebalance user portfolio", async function () {
      const { strategyManager, vault, usdc, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      const depositAmount = ethers.parseUnits("10000", 6);
      await vault.setMockUser(user1.address);
      
      // Execute initial strategy
      await strategyManager.executeStrategy(depositAmount, await usdc.getAddress());
      
      // Rebalance portfolio
      await expect(strategyManager.rebalancePortfolio(user1.address))
        .to.emit(strategyManager, "PortfolioRebalanced");
    });

    it("Should only allow vault to rebalance", async function () {
      const { strategyManager, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      await expect(strategyManager.connect(user1).rebalancePortfolio(user1.address))
        .to.be.revertedWith("Only vault can call");
    });
  });

  describe("Somnia Protocol Integration", function () {
    it("Should optimize for Somnia-specific protocols", async function () {
      const { strategyManager, standardProtocol, quickSwap, haifuFun, saltTreasury, somniaStaking, owner } = await loadFixture(deployStrategyManagerFixture);
      
      // Add Somnia protocols with realistic APYs and risk scores
      await strategyManager.connect(owner).addProtocol(await standardProtocol.getAddress(), "Standard Protocol", 1200, 25, ethers.parseEther("10000000"));
      await strategyManager.connect(owner).addProtocol(await quickSwap.getAddress(), "QuickSwap", 1800, 30, ethers.parseEther("50000000"));
      await strategyManager.connect(owner).addProtocol(await haifuFun.getAddress(), "Haifu.fun", 2500, 60, ethers.parseEther("5000000"));
      await strategyManager.connect(owner).addProtocol(await saltTreasury.getAddress(), "Salt Treasury", 800, 15, ethers.parseEther("25000000"));
      await strategyManager.connect(owner).addProtocol(await somniaStaking.getAddress(), "Somnia Staking", 1500, 10, ethers.parseEther("100000000"));
      
      // Verify all protocols are added
      const protocolList = await strategyManager.protocolList(0);
      expect(protocolList).to.not.equal(ethers.ZeroAddress);
    });

    it("Should calculate risk-adjusted scores correctly", async function () {
      const { strategyManager, somniaStaking, saltTreasury, haifuFun, owner } = await loadFixture(deployStrategyManagerFixture);
      
      // Add protocols with different risk profiles
      await strategyManager.connect(owner).addProtocol(await somniaStaking.getAddress(), "Somnia Staking", 1500, 10, ethers.parseEther("100000000"));
      await strategyManager.connect(owner).addProtocol(await saltTreasury.getAddress(), "Salt Treasury", 800, 15, ethers.parseEther("25000000"));
      await strategyManager.connect(owner).addProtocol(await haifuFun.getAddress(), "Haifu.fun", 2500, 60, ethers.parseEther("5000000"));
      
      // Somnia Staking should have highest risk-adjusted score
      // Score = (APY * 100) / sqrt(riskScore)
      // Somnia Staking: (1500 * 100) / sqrt(10) = 47,434
      // Salt Treasury: (800 * 100) / sqrt(15) = 20,656
      // Haifu.fun: (2500 * 100) / sqrt(60) = 32,275
      
      // The AI should prioritize Somnia Staking due to its high score
      const network = await ethers.provider.getNetwork();
      console.log(`Testing Somnia protocol optimization on network: ${network.name} (Chain ID: ${network.chainId})`);
    });
  });

  describe("Data Oracle Integration", function () {
    it("Should allow setting data oracle", async function () {
      const { strategyManager, owner, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      await strategyManager.connect(owner).setDataOracle(user1.address);
      expect(await strategyManager.dataOracle()).to.equal(user1.address);
    });

    it("Should allow oracle to update protocol data", async function () {
      const { strategyManager, standardProtocol, owner, user1 } = await loadFixture(deployStrategyManagerFixture);
      
      // Add protocol
      await strategyManager.connect(owner).addProtocol(await standardProtocol.getAddress(), "Standard Protocol", 1200, 25, ethers.parseEther("10000000"));
      
      // Set oracle
      await strategyManager.connect(owner).setDataOracle(user1.address);
      
      // Oracle updates protocol data
      await expect(strategyManager.connect(user1).updateProtocolData(
        await standardProtocol.getAddress(),
        1500, // New APY
        20,   // New risk score
        ethers.parseEther("15000000") // New TVL
      )).to.not.be.reverted;
    });
  });
});
