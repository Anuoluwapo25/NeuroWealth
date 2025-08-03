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
    crossfi: {
      url: process.env.CROSSFI_RPC_URL || "https://rpc.crossfi.com",
      chainId: 4157,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    crossfiTestnet: {
      url: process.env.CROSSFI_TESTNET_RPC_URL || "https://testnet-rpc.crossfi.com",
      chainId: 4157,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 30000000, // 30M gas limit
    },
  },
  etherscan: {
    apiKey: {
      crossfi: process.env.CROSSFI_API_KEY || "",
    },
    customChains: [
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
