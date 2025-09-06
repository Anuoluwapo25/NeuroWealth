import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
                    somnia: {
                  url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
                  chainId: 50312,
                  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
                },
                somniaTestnet: {
                  url: process.env.SOMNIA_TESTNET_RPC_URL || "https://dream-rpc.somnia.network",
                  chainId: 50312,
                  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
                  gas: 30000000, // 30M gas limit
                },
    
  },
  etherscan: {
    apiKey: {
      somnia: process.env.SOMNIA_API_KEY || "",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 1946,
        urls: {
          apiURL: "https://explorer.somnia.network/api",
          browserURL: "https://explorer.somnia.network",
        },
      },
      {
        network: "somniaTestnet",
        chainId: 1947,
        urls: {
          apiURL: "https://testnet-explorer.somnia.network/api",
          browserURL: "https://testnet-explorer.somnia.network",
        },
      },
      {
        network: "crossfi",
        chainId: 4157,
        urls: {
          apiURL: "https://explorer.crossfi.com/api",
          browserURL: "https://explorer.crossfi.com",
        },
      },
      {
        network: "crossfiTestnet",
        chainId: 4158,
        urls: {
          apiURL: "https://testnet-explorer.crossfi.com/api",
          browserURL: "https://testnet-explorer.crossfi.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
