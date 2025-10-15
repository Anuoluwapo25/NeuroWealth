const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniswapV3StrategyAdapter", function () {
    let adapter, mockUSDC, mockWETH;
    let owner, strategyManager, user1, user2;

    beforeEach(async function () {
        [owner, strategyManager, user1, user2] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
        mockWETH = await MockERC20.deploy("Wrapped Ether", "WETH", 18);

        // Deploy adapter
        const UniswapV3StrategyAdapter = await ethers.getContractFactory("UniswapV3StrategyAdapter");
        adapter = await UniswapV3StrategyAdapter.deploy(strategyManager.address);
    });

    describe("Deployment", function () {
        it("Should deploy with correct initial values", async function () {
            expect(await adapter.aiStrategyManager()).to.equal(strategyManager.address);
            expect(await adapter.owner()).to.equal(owner.address);

            const config = await adapter.config();
            expect([1337, 31337]).to.include(Number(config.chainId));
        });

        it("Should initialize with correct network config", async function () {
            const config = await adapter.config();
            expect(config.positionManager).to.not.equal(ethers.ZeroAddress);
            expect(config.usdc).to.not.equal(ethers.ZeroAddress);
            expect(config.weth).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe("View Functions", function () {
        it("Should return estimated APY", async function () {
            const apy = await adapter.getEstimatedAPY();
            expect(apy).to.equal(1500); // 15%
        });

        it("Should return zero balance for user with no position", async function () {
            const balance = await adapter.getUserBalance(user1.address);
            expect(balance).to.equal(0);
        });

        it("Should return empty position for user with no position", async function () {
            const position = await adapter.getUserPosition(user1.address);
            expect(position.tokenId).to.equal(0);
            expect(position.liquidity).to.equal(0);
            expect(position.originalUSDC).to.equal(0);
        });
    });

    describe("Access Control", function () {
        it("Should allow only owner to update network config", async function () {
            const newConfig = {
                positionManager: ethers.ZeroAddress,
                swapRouter: ethers.ZeroAddress,
                factory: ethers.ZeroAddress,
                usdc: mockUSDC.target ?? mockUSDC.address, // works for both v5/v6
                weth: mockWETH.target ?? mockWETH.address,
                chainId: 1
            };

            await expect(
                adapter.connect(user1).updateNetworkConfig(newConfig)
            ).to.be.revertedWithCustomError(adapter, "OwnableUnauthorizedAccount");

            await expect(adapter.updateNetworkConfig(newConfig)).to.not.be.reverted;
        });

        it("Should allow only owner to recover NFTs", async function () {
            await expect(
                adapter.connect(user1).emergencyRecoverNFT(1)
            ).to.be.revertedWithCustomError(adapter, "OwnableUnauthorizedAccount");
        });
    });

    describe("NFT Handling", function () {
        it("Should handle ERC721 transfers correctly", async function () {
            const selector = await adapter.onERC721Received(
                owner.address,
                owner.address,
                1,
                "0x"
            );
            expect(selector).to.equal("0x150b7a02");
        });
    });

    describe("Deposit Functionality", function () {
        it("Should revert if called by non-strategy manager", async function () {
            const depositAmount = ethers.parseUnits("1000", 6);
            await expect(
                adapter.connect(user1).depositUSDC(depositAmount, user1.address)
            ).to.be.revertedWith("Only strategy manager");
        });

        it("Should revert with zero amount", async function () {
            await expect(
                adapter.connect(strategyManager).depositUSDC(0, user1.address)
            ).to.be.revertedWith("Amount must be positive");
        });
    });

    describe("Withdrawal Functionality", function () {
        it("Should revert with invalid percentage", async function () {
            await expect(
                adapter.connect(strategyManager).withdrawUserPosition(user1.address, 0)
            ).to.be.revertedWith("Invalid percentage");

            await expect(
                adapter.connect(strategyManager).withdrawUserPosition(user1.address, 101)
            ).to.be.revertedWith("Invalid percentage");
        });

        it("Should revert if no position exists", async function () {
            await expect(
                adapter.connect(strategyManager).withdrawUserPosition(user2.address, 100)
            ).to.be.revertedWith("No position found");
        });
    });

    describe("Fee Collection", function () {
        it("Should revert fee collection for non-existent position", async function () {
            await expect(adapter.collectFees(user2.address)).to.be.revertedWith("No position found");
        });
    });
});
