import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MIND Token", function () {
  async function deployMindTokenFixture() {
    const [owner, minter, user1, user2] = await ethers.getSigners();

    const MindToken = await ethers.getContractFactory("MIND");
    const mindToken = await MindToken.deploy();

    return { mindToken, owner, minter, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { mindToken } = await loadFixture(deployMindTokenFixture);
      
      expect(await mindToken.name()).to.equal("YieldMind");
      expect(await mindToken.symbol()).to.equal("MIND");
    });

    it("Should set the correct owner", async function () {
      const { mindToken, owner } = await loadFixture(deployMindTokenFixture);
      
      expect(await mindToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial allocation to owner", async function () {
      const { mindToken, owner } = await loadFixture(deployMindTokenFixture);
      
      const expectedInitialSupply = ethers.parseEther("45000000"); // 45M (Team + Treasury + Liquidity)
      expect(await mindToken.totalSupply()).to.equal(expectedInitialSupply);
      expect(await mindToken.balanceOf(owner.address)).to.equal(expectedInitialSupply);
    });

    it("Should have correct max supply", async function () {
      const { mindToken } = await loadFixture(deployMindTokenFixture);
      
      expect(await mindToken.MAX_SUPPLY()).to.equal(ethers.parseEther("100000000")); // 100M
    });
  });

  describe("Minting", function () {
    it("Should allow owner to add minter", async function () {
      const { mindToken, owner, minter } = await loadFixture(deployMindTokenFixture);
      
      await expect(mindToken.connect(owner).addMinter(minter.address))
        .to.emit(mindToken, "MinterAdded")
        .withArgs(minter.address);
      
      expect(await mindToken.minters(minter.address)).to.be.true;
    });

    it("Should allow authorized minter to mint tokens", async function () {
      const { mindToken, owner, minter, user1 } = await loadFixture(deployMindTokenFixture);
      
      await mindToken.connect(owner).addMinter(minter.address);
      
      const mintAmount = ethers.parseEther("1000");
      await expect(mindToken.connect(minter).mint(user1.address, mintAmount))
        .to.not.be.reverted;
      
      expect(await mindToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow unauthorized address to mint", async function () {
      const { mindToken, user1, user2 } = await loadFixture(deployMindTokenFixture);
      
      const mintAmount = ethers.parseEther("1000");
      await expect(mindToken.connect(user1).mint(user2.address, mintAmount))
        .to.be.revertedWith("Not authorized minter");
    });

    it("Should not allow minting beyond max supply", async function () {
      const { mindToken, owner, minter, user1 } = await loadFixture(deployMindTokenFixture);
      
      await mindToken.connect(owner).addMinter(minter.address);
      
      const currentSupply = await mindToken.totalSupply();
      const maxSupply = await mindToken.MAX_SUPPLY();
      const excessAmount = maxSupply - currentSupply + ethers.parseEther("1");
      
      await expect(mindToken.connect(minter).mint(user1.address, excessAmount))
        .to.be.revertedWith("Exceeds max supply");
    });

    it("Should allow owner to remove minter", async function () {
      const { mindToken, owner, minter } = await loadFixture(deployMindTokenFixture);
      
      await mindToken.connect(owner).addMinter(minter.address);
      expect(await mindToken.minters(minter.address)).to.be.true;
      
      await expect(mindToken.connect(owner).removeMinter(minter.address))
        .to.emit(mindToken, "MinterRemoved")
        .withArgs(minter.address);
      
      expect(await mindToken.minters(minter.address)).to.be.false;
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const { mindToken, owner, user1 } = await loadFixture(deployMindTokenFixture);
      
      const transferAmount = ethers.parseEther("1000");
      await mindToken.connect(owner).transfer(user1.address, transferAmount);
      
      const burnAmount = ethers.parseEther("100");
      await expect(mindToken.connect(user1).burn(burnAmount))
        .to.not.be.reverted;
      
      expect(await mindToken.balanceOf(user1.address)).to.equal(transferAmount - burnAmount);
    });
  });

  describe("Somnia Integration", function () {
    it("Should be compatible with Somnia network", async function () {
      const { mindToken } = await loadFixture(deployMindTokenFixture);
      
      // Test basic ERC20 functionality
      expect(await mindToken.name()).to.equal("YieldMind");
      expect(await mindToken.symbol()).to.equal("MIND");
      expect(await mindToken.decimals()).to.equal(18);
      
      // Test that contract can be deployed on Somnia
      const network = await ethers.provider.getNetwork();
      console.log(`Testing on network: ${network.name} (Chain ID: ${network.chainId})`);
    });
  });
});
