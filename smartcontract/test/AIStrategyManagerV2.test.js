const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIStrategyManagerV2", function () {
    let strategyManager, mockVault, mockUSDC, mockAeroAdapter;
    let owner, user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy mocks
        const MockNeuroWealthVault = await ethers.getContractFactory("contracts/mocks/MockContract.sol:MockNeuroWealthVault");
        mockVault = await MockNeuroWealthVault.deploy();

        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);

        // Deploy strategy manager
        const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
        strategyManager = await AIStrategyManagerV2.deploy(mockVault.target);
        
        // Set USDC address
        await strategyManager.setUSDC(mockUSDC.target);

        // Deploy mock Aerodrome adapter
        const AerodromeAdapter = await ethers.getContractFactory("MockAerodromeStrategyAdapter");
        mockAeroAdapter = await AerodromeAdapter.deploy(strategyManager.target);
    });

    describe("Protocol Management", function () {
        it("Should allow owner to add protocols", async function () {
            // Updated to use 7 parameters including protocolType
            await expect(
                strategyManager.addProtocol(
                    mockAeroAdapter.target,
                    "Test Protocol",
                    "mock",  // Added protocolType parameter
                    2000,    // 20% APY
                    30,      // Risk score
                    ethers.parseUnits("1000000", 6), // 1M TVL
                    true     // Is active
                )
            ).to.emit(strategyManager, "ProtocolAdded");

            // Check protocol was added
            const protocol = await strategyManager.protocols(mockAeroAdapter.target);
            expect(protocol.name).to.equal("Test Protocol");
            expect(protocol.currentAPY).to.equal(2000);
            expect(protocol.riskScore).to.equal(30);
        });

        it("Should prevent non-owners from adding protocols", async function () {
            await expect(
                strategyManager.connect(user1).addProtocol(
                    mockAeroAdapter.target,
                    "Test Protocol",
                    "mock",
                    2000, 30, ethers.parseUnits("1000000", 6), true
                )
            ).to.be.revertedWithCustomError(strategyManager, "OwnableUnauthorizedAccount");
        });

        it("Should initialize Aerodrome correctly", async function () {
            // Changed from initializeAerodrome to addMockProtocol
            await strategyManager.addMockProtocol(
                mockAeroAdapter.target,
                "Aerodrome Finance USDC/WETH",
                800,  // 8% APY
                25    // Risk score
            );

            const protocol = await strategyManager.protocols(mockAeroAdapter.target);
            expect(protocol.name).to.equal("Aerodrome Finance USDC/WETH");
            expect(protocol.protocolType).to.equal("mock");
        });
    });

    describe("Strategy Execution", function () {
        beforeEach(async function () {
            // Initialize mock protocol
            await strategyManager.addMockProtocol(
                mockAeroAdapter.target,
                "Mock Protocol",
                800,
                25
            );

            // Mint USDC to mock vault
            await mockUSDC.mint(mockVault.target, ethers.parseUnits("10000", 6));
            
            // Approve strategy manager to spend vault's USDC
            await mockVault.approveToken(mockUSDC.target, strategyManager.target, ethers.parseUnits("10000", 6));
        });

        it("Should execute strategy from vault", async function () {
            const amount = ethers.parseUnits("1000", 6);

            // Call executeStrategy FROM the mockVault
            await expect(
                mockVault.callExecuteStrategy(strategyManager.target, amount, mockUSDC.target)
            ).to.emit(strategyManager, "StrategyExecuted");
        });

        it("Should reject execution from non-vault", async function () {
            const amount = ethers.parseUnits("1000", 6);

            await expect(
                strategyManager.connect(user1).executeStrategy(amount, mockUSDC.target)
            ).to.be.revertedWith("Only vault can call");
        });

        it("Should only accept USDC", async function () {
            // Try with different token
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            const mockDAI = await MockERC20.deploy("DAI", "DAI", 18);

            const amount = ethers.parseUnits("1000", 18);
            
            // Mint DAI to vault
            await mockDAI.mint(mockVault.target, amount);

            // The mock vault wrapper catches the revert and returns "Strategy execution failed"
            await expect(
                mockVault.callExecuteStrategy(strategyManager.target, amount, mockDAI.target)
            ).to.be.revertedWith("Strategy execution failed");
        });
    });
});