require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

console.log("============================================");
console.log("🔱 FORK MODE: Base Mainnet (Latest Block)");
console.log("============================================");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      chainId: 8453,
      forking: {
        url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
        enabled: true,
        // Using latest block - will be slower but ensures all contracts are deployed
        // If you want faster tests, pin to a recent block (e.g., 30000000+)
      },
      chains: {
        8453: {
          hardforkHistory: {
            berlin: 0,
            london: 0,
            arrowGlacier: 0,
            grayGlacier: 0,
            merge: 0,
            shanghai: 0,
            cancun: 0,
          },
        },
      },
      // Fix gas price issues
      gasPrice: "auto",
      initialBaseFeePerGas: 0,
      // Allow larger gas limits for complex transactions
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
  },
  mocha: {
    timeout: 120000, // Increased to 120 seconds for fork tests with latest block
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
};