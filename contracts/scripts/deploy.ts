import hre from "hardhat";
import { parseEther } from "viem";
import * as fs from "fs";

async function main() {
  console.log("Starting deployment to Arbitrum Sepolia...");

  // Get provider and signer
  const provider = hre.network.provider;

  const RatherToken = await hre.artifacts.readArtifact("RatherToken");
  const RatherNFT = await hre.artifacts.readArtifact("RatherNFT");
  const RatherMarketplace = await hre.artifacts.readArtifact(
    "RatherMarketplace"
  );
  const RatherLiquidityPool = await hre.artifacts.readArtifact(
    "RatherLiquidityPool"
  );
  const RatherTreasury = await hre.artifacts.readArtifact("RatherTreasury");

  // Get the deployer address from private key
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set in .env");
  }

  const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  console.log("Deploying contracts...");
  console.log(
    "Note: This requires the Arbitrum Sepolia testnet to be accessible at https://sepolia-rollup.arbitrum.io/rpc"
  );
  console.log(
    "You need testnet ETH - get it from: https://faucet.quicknode.com/arbitrum/sepolia"
  );

  throw new Error(
    "Deployment script requires direct RPC interactions. " +
      "Use hardhat ignition instead:\n" +
      "npx hardhat ignition deploy ignition/modules/RatherProtocol.ts --network arbitrumSepolia\n\n" +
      "Or ensure you have sufficient testnet ETH and the private key is properly set in .env"
  );
}

main().catch((error) => {
  console.error("Deployment failed:", error.message);
  process.exitCode = 1;
});
