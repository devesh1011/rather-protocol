import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: "0.8.28",
  },
  networks: {
    arbitrumSepolia: {
      type: "http",
      chainId: 421614,
      url: "https://arbitrum-sepolia-rpc.publicnode.com",
      accounts: PRIVATE_KEY !== "0x" ? [PRIVATE_KEY] : [],
    },
  },
});
