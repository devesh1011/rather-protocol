import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const RatherProtocolModule = buildModule("RatherProtocolModule", (m) => {
  // Deploy parameters
  const initialSupply = parseEther("1000000"); // 1M RATHER tokens
  const mintPrice = 0n; // Free mints for demo
  const baseURI = "ipfs://QmExample/"; // Update with actual IPFS base URI

  // 1. Deploy RatherToken
  const ratherToken = m.contract("RatherToken", [
    "Rather",
    "RATHER",
    initialSupply,
  ]);

  // 2. Deploy RatherNFT
  const ratherNFT = m.contract("RatherNFT", [
    "RatherNFT",
    "RNFT",
    baseURI,
    mintPrice,
  ]);

  // 3. Deploy RatherMarketplace
  const marketplace = m.contract("RatherMarketplace", [ratherNFT]);

  // 4. Deploy RatherLiquidityPool
  const liquidityPool = m.contract("RatherLiquidityPool", [ratherToken]);

  // 5. Deploy RatherTreasury
  const treasury = m.contract("RatherTreasury", [ratherToken, ratherNFT]);

  // 6. Wire up contracts
  // Set treasury in marketplace
  m.call(marketplace, "setTreasury", [treasury]);

  // Set treasury in liquidity pool
  m.call(liquidityPool, "setTreasury", [treasury]);

  // Set marketplace in treasury
  m.call(treasury, "setMarketplace", [marketplace]);

  // Set liquidity pool in treasury
  m.call(treasury, "setLiquidityPool", [liquidityPool]);

  // Set treasury in token
  m.call(ratherToken, "setTreasury", [treasury]);

  return {
    ratherToken,
    ratherNFT,
    marketplace,
    liquidityPool,
    treasury,
  };
});

export default RatherProtocolModule;
