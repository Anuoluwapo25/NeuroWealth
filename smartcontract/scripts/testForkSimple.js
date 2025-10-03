// scripts/testForkSimple.js
const { ethers } = require("hardhat");

async function main() {
    console.log("Simple fork test without Uniswap deposits...\n");

    const [deployer] = await ethers.getSigners();
    const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

    console.log("=== Deploying Contracts ===");

    const MIND = await ethers.getContractFactory("MIND");
    const mindToken = await MIND.deploy();
    await mindToken.waitForDeployment();
    console.log("✓ MIND:", mindToken.target);

    const MINDStaking = await ethers.getContractFactory("MINDStaking");
    const staking = await MINDStaking.deploy(mindToken.target);
    await staking.waitForDeployment();
    console.log("✓ Staking:", staking.target);

    await mindToken.addMinter(staking.target);

    const AIStrategyManagerV2 = await ethers.getContractFactory("AIStrategyManagerV2");
    const strategyManager = await AIStrategyManagerV2.deploy(deployer.address);
    await strategyManager.waitForDeployment();
    console.log("✓ Strategy Manager:", strategyManager.target);

    // Deploy vault WITHOUT strategy manager to avoid Uniswap calls
    const NeuroWealthVault = await ethers.getContractFactory("NeuroWealthVault");
    const vault = await NeuroWealthVault.deploy(
        staking.target,
        ethers.ZeroAddress, // No strategy manager
        USDC_BASE_MAINNET
    );
    await vault.waitForDeployment();
    console.log("✓ Vault:", vault.target);

    // Get USDC from whale
    console.log("\n=== Getting USDC from whale ===");
    const USDC_WHALE = "0x20FE51A9229EEf2cF8Ad9E89d91CAb9312cF3b7A";
    await ethers.provider.send("hardhat_impersonateAccount", [USDC_WHALE]);
    const whale = await ethers.getSigner(USDC_WHALE);

    const usdc = await ethers.getContractAt("IERC20", USDC_BASE_MAINNET);
    await usdc.connect(whale).transfer(deployer.address, ethers.parseUnits("10000", 6));
    console.log("✓ Received 10,000 USDC");

    // Stake MIND
    console.log("\n=== Staking MIND ===");
    await mindToken.approve(staking.target, ethers.parseEther("100"));
    await staking.stake(ethers.parseEther("100"));
    console.log("✓ Staked 100 MIND - Premium tier");

    // Deposit to vault (no strategy manager, so no Uniswap call)
    console.log("\n=== Depositing to Vault ===");
    await usdc.approve(vault.target, ethers.parseUnits("1000", 6));
    await vault.deposit(ethers.parseUnits("1000", 6));
    console.log("✓ Deposited 1,000 USDC");

    const position = await vault.getUserPosition(deployer.address);
    console.log("\n=== Position ===");
    console.log("Principal:", ethers.formatUnits(position.principal, 6), "USDC");
    console.log("Current Value:", ethers.formatUnits(position.currentValue, 6), "USDC");

    console.log("\n✅ Fork test successful!");
    console.log("Note: Uniswap integration needs router compatibility fixes");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });