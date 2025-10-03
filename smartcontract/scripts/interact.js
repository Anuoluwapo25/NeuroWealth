const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with:", deployer.address);

    // Replace with your deployed addresses
    const ADDRESSES = {
        mind: "0x7a965FC20e530757285Ad0aC578F9FdCb6ad436C",
        staking: "0x7068C248599135A123FC10Bef43DE24F0d7229F4",
        vault: "0x238753361F675c1A58f38Cd5a52c4569d05E06FE",
        //Uniswap Adapter: "0x41edac81E808E137f760c00d3B92adb4a70F67Fa",
        usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"// Base Sepolia USDC
    };

    // Get contract instances
    const mind = await ethers.getContractAt("MIND", ADDRESSES.mind);
    const staking = await ethers.getContractAt("MINDStaking", ADDRESSES.staking);
    const vault = await ethers.getContractAt("NeuroWealthVault", ADDRESSES.vault);
    const usdc = await ethers.getContractAt("IERC20", ADDRESSES.usdc);

    // Check balances
    console.log("\n=== Initial Balances ===");
    const usdcBalance = await usdc.balanceOf(deployer.address);
    const mindBalance = await mind.balanceOf(deployer.address);
    console.log("USDC:", ethers.formatUnits(usdcBalance, 6));
    console.log("MIND:", ethers.formatEther(mindBalance));

    // Step 1: Stake MIND tokens to get Premium tier
    console.log("\n=== Step 1: Staking MIND ===");
    const stakeAmount = ethers.parseEther("100"); // 100 MIND for Premium tier

    if (mindBalance >= stakeAmount) {
        console.log("Approving MIND...");
        let tx = await mind.approve(ADDRESSES.staking, stakeAmount);
        await tx.wait();

        console.log("Staking 100 MIND...");
        tx = await staking.stake(stakeAmount);
        await tx.wait();

        const tier = await staking.getUserTier(deployer.address);
        console.log("Your tier:", tier === 0 ? "Free" : tier === 1 ? "Premium" : "Pro");
    } else {
        console.log("Not enough MIND tokens. You have:", ethers.formatEther(mindBalance));
    }

    // Step 2: Deposit USDC into vault
    console.log("\n=== Step 2: Depositing USDC ===");
    const depositAmount = ethers.parseUnits("100", 6); // 100 USDC

    if (usdcBalance >= depositAmount) {
        console.log("Approving USDC...");
        let tx = await usdc.approve(ADDRESSES.vault, depositAmount);
        await tx.wait();
        console.log("Approved!");

        console.log("Depositing 100 USDC...");
        tx = await vault.deposit(depositAmount);
        await tx.wait();
        console.log("Deposited!");

        // Check position
        const position = await vault.getUserPosition(deployer.address);
        console.log("\nYour Position:");
        console.log("Principal:", ethers.formatUnits(position.principal, 6), "USDC");
        console.log("Current Value:", ethers.formatUnits(position.currentValue, 6), "USDC");
        console.log("Tier:", position.userTier);
    } else {
        console.log("Not enough USDC. You have:", ethers.formatUnits(usdcBalance, 6));
    }

    // Step 3: Check vault TVL
    console.log("\n=== Vault Stats ===");
    const tvl = await vault.totalValueLocked();
    console.log("Total Value Locked:", ethers.formatUnits(tvl, 6), "USDC");

    // Step 4: Withdraw (optional - comment out if you don't want to withdraw yet)
    
    console.log("\n=== Step 3: Withdrawing ===");
    const withdrawAmount = ethers.parseUnits("50", 6); // Withdraw 50 USDC
    let tx = await vault.withdraw(withdrawAmount);
    await tx.wait();
    console.log("Withdrawn 50 USDC");
    
    const newBalance = await usdc.balanceOf(deployer.address);
    console.log("New USDC balance:", ethers.formatUnits(newBalance, 6));
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});