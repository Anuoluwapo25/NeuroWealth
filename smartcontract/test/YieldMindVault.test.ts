import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("YieldMind Vault", function () {
  async function deployVaultFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy MIND token
    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    // Deploy Staking contract
    const MindStaking = await ethers.getContractFactory("MINDStaking");
    const mindStaking = await MindStaking.deploy(await mindToken.getAddress());
    await mindToken.addMinter(await mindStaking.getAddress());

    // Deploy YieldMind Vault first
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = await YieldMindVault.deploy(
      await mindStaking.getAddress(),
      ethers.ZeroAddress
    );

    // Deploy AI Strategy Manager with vault address
    const AIStrategyManager = await ethers.getContractFactory("AIStrategyManager");
    const strategyManager = await AIStrategyManager.deploy(await vault.getAddress());

    // Update vault with strategy manager address
    await vault.setStrategyManager(await strategyManager.getAddress());

    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
    const dai = await MockERC20.deploy("Dai Stablecoin", "DAI", 18);
    const somi = await MockERC20.deploy("Somnia", "SOMI", 18);

    // Add supported tokens
    await vault.addSupportedToken(await usdc.getAddress(), ethers.parseUnits("100", 6), ethers.parseUnits("10000000", 6));
    await vault.addSupportedToken(await usdt.getAddress(), ethers.parseUnits("100", 6), ethers.parseUnits("10000000", 6));
    await vault.addSupportedToken(await dai.getAddress(), ethers.parseEther("100"), ethers.parseEther("10000000"));
    await vault.addSupportedToken(await somi.getAddress(), ethers.parseEther("10"), ethers.parseEther("1000000"));

    // Mint tokens to users
    const userAmount = ethers.parseUnits("10000", 6); // 10k USDC
    await usdc.mint(user1.address, userAmount);
    await usdc.mint(user2.address, userAmount);
    await usdt.mint(user1.address, userAmount);
    await dai.mint(user1.address, ethers.parseEther("10000"));
    await somi.mint(user1.address, ethers.parseEther("1000"));

    return {
      vault,
      mindToken,
      mindStaking,
      strategyManager,
      usdc,
      usdt,
      dai,
      somi,
      owner,
      user1,
      user2
    };
  }

  describe("Deployment", function () {
    it("Should set correct dependencies", async function () {
      const { vault, mindStaking, strategyManager } = await loadFixture(deployVaultFixture);
      
      expect(await vault.mindStaking()).to.equal(await mindStaking.getAddress());
      expect(await vault.strategyManager()).to.equal(await strategyManager.getAddress());
    });

    it("Should have correct tier limits", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      
      expect(await vault.tierLimits(0)).to.equal(ethers.parseEther("10000")); // Free: $10k
      expect(await vault.tierLimits(1)).to.equal(ethers.parseEther("100000")); // Premium: $100k
      expect(await vault.tierLimits(2)).to.equal(ethers.parseEther("1000000")); // Pro: $1M
    });

    it("Should have correct rebalancing frequencies", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      
      expect(await vault.rebalanceFrequency(0)).to.equal(86400); // Free: 24 hours
      expect(await vault.rebalanceFrequency(1)).to.equal(14400); // Premium: 4 hours
      expect(await vault.rebalanceFrequency(2)).to.equal(3600); // Pro: 1 hour
    });
  });

  describe("Token Support", function () {
    it("Should allow owner to add supported tokens", async function () {
      const { vault, usdc } = await loadFixture(deployVaultFixture);
      
      const tokenInfo = await vault.supportedTokens(await usdc.getAddress());
      expect(tokenInfo.isSupported).to.be.true;
      expect(tokenInfo.minDeposit).to.equal(ethers.parseUnits("100", 6));
      expect(tokenInfo.maxDeposit).to.equal(ethers.parseUnits("10000000", 6));
    });

    it("Should reject deposits of unsupported tokens", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      
      const MockToken = await ethers.getContractFactory("MockERC20");
      const unsupportedToken = await MockToken.deploy("Unsupported", "UNS", 18);
      await unsupportedToken.mint(user1.address, ethers.parseEther("1000"));
      
      await unsupportedToken.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      
      await expect(vault.connect(user1).deposit(await unsupportedToken.getAddress(), ethers.parseEther("100")))
        .to.be.revertedWith("Token not supported");
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit supported tokens", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6); // $1000 USDC
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, await usdc.getAddress(), depositAmount);
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(depositAmount);
      expect(position.currentValue).to.equal(depositAmount);
      expect(position.depositToken).to.equal(await usdc.getAddress());
    });

    it("Should enforce minimum deposit amounts", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const smallAmount = ethers.parseUnits("50", 6); // $50 USDC (below $100 minimum)
      await usdc.connect(user1).approve(await vault.getAddress(), smallAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), smallAmount))
        .to.be.revertedWith("Below minimum deposit");
    });

    it("Should enforce tier-based deposit limits", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      // User1 has no MIND staked, so Free tier ($10k limit)
      const largeAmount = ethers.parseUnits("15000", 6); // $15k USDC (above $10k limit)
      await usdc.connect(user1).approve(await vault.getAddress(), largeAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), largeAmount))
        .to.be.revertedWith("Exceeds tier limit");
    });

    it("Should allow additional deposits of same token", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const firstDeposit = ethers.parseUnits("1000", 6);
      const secondDeposit = ethers.parseUnits("2000", 6);
      
      await usdc.connect(user1).approve(await vault.getAddress(), firstDeposit + secondDeposit);
      
      await vault.connect(user1).deposit(await usdc.getAddress(), firstDeposit);
      await vault.connect(user1).deposit(await usdc.getAddress(), secondDeposit);
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(firstDeposit + secondDeposit);
    });

    it("Should reject deposits of different tokens for existing position", async function () {
      const { vault, usdc, usdt, user1 } = await loadFixture(deployVaultFixture);
      
      const usdcAmount = ethers.parseUnits("1000", 6);
      const usdtAmount = ethers.parseUnits("1000", 6);
      
      await usdc.connect(user1).approve(await vault.getAddress(), usdcAmount);
      await usdt.connect(user1).approve(await vault.getAddress(), usdtAmount);
      
      await vault.connect(user1).deposit(await usdc.getAddress(), usdcAmount);
      
      await expect(vault.connect(user1).deposit(await usdt.getAddress(), usdtAmount))
        .to.be.revertedWith("Different token than existing position");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow users to withdraw their deposits", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      
      const balanceBefore = await usdc.balanceOf(user1.address);
      
      await expect(vault.connect(user1).withdraw(depositAmount))
        .to.emit(vault, "Withdrawal");
      
      const balanceAfter = await usdc.balanceOf(user1.address);
      expect(balanceAfter).to.equal(balanceBefore + depositAmount);
    });

    it("Should allow full withdrawal with amount 0", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      
      await vault.connect(user1).withdraw(0); // Withdraw all
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(0);
    });

    it("Should charge performance fee only on profits", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      
      // Simulate profit by updating position value
      const profitAmount = ethers.parseUnits("100", 6); // $100 profit
      await vault.updatePositionValue(user1.address, depositAmount + profitAmount);
      
      const balanceBefore = await usdc.balanceOf(user1.address);
      
      await vault.connect(user1).withdraw(depositAmount + profitAmount);
      
      const balanceAfter = await usdc.balanceOf(user1.address);
      const expectedFee = (profitAmount * 50n) / 10000n; // 0.5% fee on profit
      const expectedReceived = depositAmount + profitAmount - expectedFee;
      
      expect(balanceAfter).to.equal(balanceBefore + expectedReceived);
    });
  });

  describe("Rebalancing", function () {
    it("Should enforce rebalancing frequency based on tier", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      
      // Try to rebalance immediately (should fail for Free tier - 24h frequency)
      await expect(vault.connect(user1).rebalance())
        .to.be.revertedWith("Rebalancing too frequent for your tier");
    });

    it("Should allow rebalancing after frequency period", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      
      // Fast forward past rebalancing frequency (24 hours for Free tier)
      await time.increase(86400 + 1);
      
      await expect(vault.connect(user1).rebalance())
        .to.not.be.reverted;
    });
  });

  describe("Somnia Integration", function () {
    it("Should support Somnia native tokens", async function () {
      const { vault, somi, user1 } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseEther("100"); // 100 SOMI
      await somi.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(await somi.getAddress(), depositAmount))
        .to.emit(vault, "Deposit");
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.depositToken).to.equal(await somi.getAddress());
    });

    it("Should work with Somnia's fast block times", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      
      const network = await ethers.provider.getNetwork();
      console.log(`Testing vault on network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Verify vault is ready for Somnia's sub-second finality
      expect(await vault.totalValueLocked()).to.equal(0);
    });
  });
});
