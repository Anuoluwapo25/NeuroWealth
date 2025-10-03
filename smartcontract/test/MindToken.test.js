const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MIND Token", function () {
    let mindToken;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MIND = await ethers.getContractFactory("MIND");
        mindToken = await MIND.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await mindToken.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await mindToken.name()).to.equal("NeuroWealth");
            expect(await mindToken.symbol()).to.equal("MIND");
        });

        it("Should mint initial allocation to owner", async function () {
            const expectedAmount = ethers.parseEther("45000000"); // 15M + 20M + 10M
            expect(await mindToken.balanceOf(owner.address)).to.equal(expectedAmount);
        });

        it("Should have correct total supply after deployment", async function () {
            const expectedAmount = ethers.parseEther("45000000");
            expect(await mindToken.totalSupply()).to.equal(expectedAmount);
        });
    });

    describe("Minter Management", function () {
        it("Should allow owner to add minters", async function () {
            await mindToken.addMinter(addr1.address);
            expect(await mindToken.minters(addr1.address)).to.be.true;
        });

        it("Should allow owner to remove minters", async function () {
            await mindToken.addMinter(addr1.address);
            await mindToken.removeMinter(addr1.address);
            expect(await mindToken.minters(addr1.address)).to.be.false;
        });

        it("Should prevent non-owners from adding minters", async function () {
            await expect(
                mindToken.connect(addr1).addMinter(addr2.address)
            ).to.be.revertedWithCustomError(mindToken, "OwnableUnauthorizedAccount");
        });
    });

    describe("Minting", function () {
        beforeEach(async function () {
            await mindToken.addMinter(addr1.address);
        });

        it("Should allow authorized minters to mint", async function () {
            const mintAmount = ethers.parseEther("1000");
            await mindToken.connect(addr1).mint(addr2.address, mintAmount);
            expect(await mindToken.balanceOf(addr2.address)).to.equal(mintAmount);
        });

        it("Should prevent non-minters from minting", async function () {
            const mintAmount = ethers.parseEther("1000");
            await expect(
                mindToken.connect(addr2).mint(addr2.address, mintAmount)
            ).to.be.revertedWith("Not authorized minter");
        });

        it("Should respect max supply limit", async function () {
            const maxSupply = await mindToken.MAX_SUPPLY();
            const currentSupply = await mindToken.totalSupply();
            const remainingSupply = maxSupply - currentSupply;

            // Try to mint more than remaining supply
            await expect(
                mindToken.connect(addr1).mint(addr2.address, remainingSupply + ethers.parseEther("1"))
            ).to.be.revertedWith("Exceeds max supply");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            // Transfer some tokens to addr1 for burning tests
            await mindToken.transfer(addr1.address, ethers.parseEther("1000"));
        });

        it("Should allow token holders to burn their tokens", async function () {
            const burnAmount = ethers.parseEther("100");
            const initialBalance = await mindToken.balanceOf(addr1.address);

            await mindToken.connect(addr1).burn(burnAmount);

            const finalBalance = await mindToken.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance - burnAmount);
        });
    });
});