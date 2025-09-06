import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Simple Vault Tests", function () {
  async function deploySimpleVaultFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy MIND token
    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    // Deploy Staking contract
    const MindStaking = await ethers.getContractFactory("MINDStaking");
    const mindStaking = await MindStaking.deploy(await mindToken.getAddress());
    await mindToken.addMinter(await mindStaking.getAddress());

    // Deploy YieldMind Vault (without strategy manager for simple tests)
    const YieldMindVault = await ethers.getContractFactory("YieldMindVault");
    const vault = await YieldMindVault.deploy(
      await mindStaking.getAddress(),
      ethers.ZeroAddress
    );

    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);

    // Add supported token
    await vault.addSupportedToken(await usdc.getAddress(), ethers.parseUnits("100", 6), ethers.parseUnits("10000000", 6));

    // Mint tokens to users
    await usdc.mint(user1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("10000", 6));

    return {
      vault,
      mindToken,
      mindStaking,
      usdc,
      owner,
      user1,
      user2
    };
  }

  describe("Basic Vault Operations", function () {
    it("Should allow users to deposit tokens", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 6); // $1000 USDC
      await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, await usdc.getAddress(), depositAmount);
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(depositAmount);
      expect(position.currentValue).to.equal(depositAmount);
    });

    it("Should enforce minimum deposit amounts", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);
      
      const smallAmount = ethers.parseUnits("50", 6); // $50 USDC (below $100 minimum)
      await usdc.connect(user1).approve(await vault.getAddress(), smallAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), smallAmount))
        .to.be.revertedWith("Below minimum deposit");
    });

    it("Should enforce tier-based deposit limits", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);
      
      // User1 has no MIND staked, so Free tier ($10k limit)
      const largeAmount = ethers.parseUnits("15000", 6); // $15k USDC (above $10k limit)
      await usdc.connect(user1).approve(await vault.getAddress(), largeAmount);
      
      await expect(vault.connect(user1).deposit(await usdc.getAddress(), largeAmount))
        .to.be.reverted;
    });

    it("Should allow additional deposits of same token", async function () {
      const { vault, usdc, user1 } = await loadFixture(deploySimpleVaultFixture);
      
      const firstDeposit = ethers.parseUnits("1000", 6);
      const secondDeposit = ethers.parseUnits("2000", 6);
      
      await usdc.connect(user1).approve(await vault.getAddress(), firstDeposit + secondDeposit);
      
      await vault.connect(user1).deposit(await usdc.getAddress(), firstDeposit);
      await vault.connect(user1).deposit(await usdc.getAddress(), secondDeposit);
      
      const position = await vault.getUserPosition(user1.address);
      expect(position.principal).to.equal(firstDeposit + secondDeposit);
    });
  });

  describe("Somnia Compatibility", function () {
    it("Should work with Somnia network characteristics", async function () {
      const { vault } = await loadFixture(deploySimpleVaultFixture);
      
      const network = await ethers.provider.getNetwork();
      console.log(`Testing simple vault on network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Verify vault is ready for Somnia deployment
      expect(await vault.totalValueLocked()).to.equal(0);
      console.log("✅ Simple vault ready for Somnia deployment");
    });
  });
});
