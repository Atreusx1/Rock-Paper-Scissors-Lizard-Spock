// hardhat.config.ts
import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    profiles: {
      default: {
        version: "0.4.26",
      },
      production: {
        version: "0.4.26",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    polygonAmoy: {
      type: "http",
      chainType: "l1",
      url: "https://rpc-amoy.polygon.technology",
      accounts: {
        mnemonic: configVariable("MNEMONIC"),
      },
      chainId: 80002,
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: {
        mnemonic: configVariable("MNEMONIC"),
      },
    },
  },
};

export default config;
