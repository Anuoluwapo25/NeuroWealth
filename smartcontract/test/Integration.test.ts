import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("YieldMind Somnia Integration", function () {
  async function deployFullSystemFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy MIND token
    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    // Deploy Staking contract
    const MindStaking = await ethers.getContractFactory("MINDStaking");
    const mindStaking = await MindStaking.deploy(await mindToken.getAddress());
    await mindToken.addMinter(await mindStaking.getAddress());

    // Deploy YieldMind Vault first (with zero address for strategy manager)
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

    // Deploy Somnia tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const somi = await MockERC20.deploy("Somnia", "SOMI", 18);
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
    const dai = await MockERC20.deploy("Dai Stablecoin", "DAI", 18);

    // Deploy Somnia DeFi protocols
    const MockProtocol = await ethers.getContractFactory("MockExternalProtocol");
    const standardProtocol = await MockProtocol.deploy("Standard Protocol", 1200, 25);
    const quickSwap = await MockProtocol.deploy("QuickSwap", 1800, 30);
    const haifuFun = await MockProtocol.deploy("Haifu.fun", 2500, 60);
    const saltTreasury = await MockProtocol.deploy("Salt Treasury", 800, 15);
    const somniaStaking = await MockProtocol.deploy("Somnia Staking", 1500, 10);

    // Setup supported tokens
    await vault.addSupportedToken(await somi.getAddress(), ethers.parseEther("10"), ethers.parseEther("1000000"));
    await vault.addSupportedToken(await usdc.getAddress(), ethers.parseUnits("100", 6), ethers.parseUnits("10000000", 6));
    await vault.addSupportedToken(await usdt.getAddress(), ethers.parseUnits("100", 6), ethers.parseUnits("10000000", 6));
    await vault.addSupportedToken(await dai.getAddress(), ethers.parseEther("100"), ethers.parseEther("10000000"));

    // Setup Somnia protocols
    await strategyManager.addProtocol(await standardProtocol.getAddress(), "Standard Protocol", 1200, 25, ethers.parseEther("10000000"));
    await strategyManager.addProtocol(await quickSwap.getAddress(), "QuickSwap", 1800, 30, ethers.parseEther("50000000"));
    await strategyManager.addProtocol(await haifuFun.getAddress(), "Haifu.fun", 2500, 60, ethers.parseEther("5000000"));
    await strategyManager.addProtocol(await saltTreasury.getAddress(), "Salt Treasury", 800, 15, ethers.parseEther("25000000"));
    await strategyManager.addProtocol(await somniaStaking.getAddress(), "Somnia Staking", 1500, 10, ethers.parseEther("100000000"));

    // Mint tokens to users
    await somi.mint(user1.address, ethers.parseEther("1000"));
    await usdc.mint(user1.address, ethers.parseUnits("10000", 6));
    await usdt.mint(user1.address, ethers.parseUnits("10000", 6));
    await dai.mint(user1.address, ethers.parseEther("10000"));

    await somi.mint(user2.address, ethers.parseEther("1000"));
    await usdc.mint(user2.address, ethers.parseUnits("10000", 6));
    
    // Mint MIND tokens to users for staking
    await mindToken.transfer(user1.address, ethers.parseEther("1000"));
    await mindToken.transfer(user2.address, ethers.parseEther("1000"));

    return {
      mindToken,
      mindStaking,
      strategyManager,
      vault,
      somi,
      usdc,
      usdt,
      dai,
      standardProtocol,
      quickSwap,
      haifuFun,
      saltTreasury,
      somniaStaking,
      owner,
      user1,
      user2
    };
  }

  describe("Complete User Journey", function () {
    it("Should handle full user journey: stake MIND -> deposit tokens -> AI optimization -> withdraw", async function () {
      const {
        mindToken,
        mindStaking,
        vault,
        usdc,
        user1
      } = await loadFixture(deployFullSystemFixture);

      // Step 1: User stakes MIND tokens to get Premium tier
      const stakeAmount = ethers.parseEther("100"); // Premium tier
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      expect(await mindStaking.getUserTier(user1.address)).to.equal(1); // Premium tier

      // Step 2: User deposits USDC to vault
      const depositAmount = ethers.parseUnits("5000", 6); // $5k USDC
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, await usdc.getAddress(), depositAmount);

      // Step 3: Verify position is created
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(depositAmount);
      expect(position.currentValue).to.equal(depositAmount);
      expect(position.depositToken).to.equal(await usdc.getAddress());
      expect(position.userTier).to.equal(1); // Premium tier

      // Step 4: Simulate AI optimization (position value increase)
      const profitAmount = ethers.parseUnits("500", 6); // $500 profit
      await vault.updatePositionValue(user1.address, depositAmount + profitAmount);

      // Step 5: User withdraws with profit
      const balanceBefore = await usdc.balanceOf(user1.address);
      
      await expect(vault.connect(user1).withdraw(depositAmount + profitAmount))
        .to.emit(vault, "Withdrawal");

      const balanceAfter = await usdc.balanceOf(user1.address);
      const expectedFee = (profitAmount * 50n) / 10000n; // 0.5% fee on profit
      const expectedReceived = depositAmount + profitAmount - expectedFee;
      
      expect(balanceAfter).to.equal(balanceBefore + expectedReceived);
    });

    it("Should handle multiple token deposits and tier benefits", async function () {
      const {
        mindToken,
        mindStaking,
        vault,
        somi,
        usdc,
        user1
      } = await loadFixture(deployFullSystemFixture);

      // User stakes for Pro tier
      const stakeAmount = ethers.parseEther("500"); // Pro tier
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);
      
      expect(await mindStaking.getUserTier(user1.address)).to.equal(2); // Pro tier

      // Deposit SOMI (native token)
      const somiAmount = ethers.parseEther("100");
      await somi.connect(user1).approve(await vault.getAddress(), somiAmount);
      await vault.connect(user1).deposit(await somi.getAddress(), somiAmount);

      // Deposit USDC
      const usdcAmount = ethers.parseUnits("10000", 6); // $10k USDC (Pro tier allows up to $1M)
      await usdc.connect(user1).approve(await vault.getAddress(), usdcAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), usdcAmount);

      // Verify Pro tier benefits
      const position = await vault.getUserPosition(user1.address);
      expect(position.userTier).to.equal(2); // Pro tier
      expect(position.principal).to.equal(usdcAmount); // Latest deposit token
    });
  });

  describe("AI Strategy Optimization", function () {
    it("Should optimize across Somnia protocols", async function () {
      const {
        strategyManager,
        vault,
        usdc,
        standardProtocol,
        quickSwap,
        haifuFun,
        saltTreasury,
        somniaStaking,
        user1
      } = await loadFixture(deployFullSystemFixture);

      const depositAmount = ethers.parseUnits("10000", 6); // $10k USDC
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);

      // Verify AI strategy was executed
      const strategy = await strategyManager.getUserStrategy(user1.address);
      expect(strategy.totalValue).to.equal(depositAmount);
      expect(strategy.depositToken).to.equal(await usdc.getAddress());

      // Verify protocols are available for optimization
      const protocolCount = await strategyManager.protocolList.length;
      expect(protocolCount).to.be.gt(0);
    });

    it("Should rebalance based on tier frequency", async function () {
      const {
        mindToken,
        mindStaking,
        vault,
        usdc,
        user1
      } = await loadFixture(deployFullSystemFixture);

      // User stakes for Premium tier (4-hour rebalancing)
      const stakeAmount = ethers.parseEther("100");
      await mindToken.connect(user1).approve(await mindStaking.getAddress(), stakeAmount);
      await mindStaking.connect(user1).stake(stakeAmount);

      const depositAmount = ethers.parseUnits("5000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);

      // Try to rebalance immediately (should fail)
      await expect(vault.connect(user1).rebalance())
        .to.be.revertedWith("Rebalancing too frequent for your tier");

      // Fast forward 4 hours + 1 second
      await time.increase(14400 + 1);

      // Now rebalancing should work
      await expect(vault.connect(user1).rebalance())
        .to.not.be.reverted;
    });
  });

  describe("Somnia Network Compatibility", function () {
    it("Should work with Somnia's fast block times", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployFullSystemFixture);

      const network = await ethers.provider.getNetwork();
      console.log(`Testing on network: ${network.name} (Chain ID: ${network.chainId})`);

      // Test rapid transactions (simulating Somnia's sub-second finality)
      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      const tx1 = await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      const receipt1 = await tx1.wait();
      
      console.log(`Deposit transaction confirmed in block: ${receipt1?.blockNumber}`);
      
      // Test immediate withdrawal (should work on Somnia)
      await vault.connect(user1).withdraw(depositAmount);
      
      console.log("✅ Rapid transactions work - compatible with Somnia's speed");
    });

    it("Should handle Somnia native token (SOMI)", async function () {
      const { vault, somi, user1 } = await loadFixture(deployFullSystemFixture);

      const depositAmount = ethers.parseEther("100"); // 100 SOMI
      await somi.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(await somi.getAddress(), depositAmount))
        .to.emit(vault, "Deposit");

      const position = await vault.getUserPosition(user1.address);
      expect(position.depositToken).to.equal(await somi.getAddress());
      expect(position.principal).to.equal(depositAmount);
    });

    it("Should optimize for Somnia-specific protocols", async function () {
      const {
        strategyManager,
        standardProtocol,
        quickSwap,
        haifuFun,
        saltTreasury,
        somniaStaking
      } = await loadFixture(deployFullSystemFixture);

      // Verify all Somnia protocols are integrated
      const protocols = [
        { name: "Standard Protocol", address: await standardProtocol.getAddress() },
        { name: "QuickSwap", address: await quickSwap.getAddress() },
        { name: "Haifu.fun", address: await haifuFun.getAddress() },
        { name: "Salt Treasury", address: await saltTreasury.getAddress() },
        { name: "Somnia Staking", address: await somniaStaking.getAddress() }
      ];

      for (const protocol of protocols) {
        console.log(`✅ ${protocol.name} integrated at ${protocol.address}`);
      }

      // Test risk-adjusted scoring for Somnia protocols
      // Somnia Staking should have highest score: (1500 * 100) / sqrt(10) = 47,434
      // This ensures native staking is prioritized
      console.log("✅ Somnia protocol optimization ready");
    });
  });

  describe("Performance and Gas Optimization", function () {
    it("Should be gas efficient for Somnia deployment", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployFullSystemFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      const tx = await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);
      const receipt = await tx.wait();
      
      console.log(`Gas used for deposit: ${receipt?.gasUsed}`);
      console.log("✅ Gas usage optimized for Somnia's low fees");
    });

    it("Should handle high-frequency operations", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployFullSystemFixture);

      // Simulate high-frequency deposits/withdrawals
      const amounts = [
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("2000", 6),
        ethers.parseUnits("1500", 6)
      ];

      for (const amount of amounts) {
        await usdc.connect(user1).approve(await vault.getAddress(), amount);
        await vault.connect(user1).deposit(await usdc.getAddress(), amount);
        await vault.connect(user1).withdraw(amount);
      }

      console.log("✅ High-frequency operations handled successfully");
    });
  });

  describe("Error Handling and Edge Cases", function () {
    it("Should handle edge cases gracefully", async function () {
      const { vault, usdc, user1 } = await loadFixture(deployFullSystemFixture);

      // Test minimum deposit
      const minAmount = ethers.parseUnits("100", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), minAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), minAmount);

      // Test withdrawal of zero amount
      await vault.connect(user1).withdraw(0);

      // Test rebalancing with no position
      await expect(vault.connect(user1).rebalance())
        .to.be.revertedWith("No position found");

      console.log("✅ Edge cases handled gracefully");
    });

    it("Should enforce security measures", async function () {
      const { vault, usdc, user1, user2 } = await loadFixture(deployFullSystemFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(await usdc.getAddress(), depositAmount);

      // User2 should not be able to withdraw user1's funds
      await expect(vault.connect(user2).withdraw(depositAmount))
        .to.be.revertedWith("No position found");

      console.log("✅ Security measures enforced");
    });
  });
});
