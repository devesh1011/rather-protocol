import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("Rather Protocol", function () {
  it("Should deploy RatherToken", async function () {
    const token = await hre.viem.deployContract("RatherToken", [
      "Rather",
      "RATHER",
      parseEther("1000000"),
    ]);

    const name = await token.read.name();
    expect(name).to.equal("Rather");
  });

  it("Should deploy RatherNFT", async function () {
    const nft = await hre.viem.deployContract("RatherNFT", [
      "RatherNFT",
      "RNFT",
      "ipfs://base/",
      0n,
    ]);

    const name = await nft.read.name();
    expect(name).to.equal("RatherNFT");
  });

  it("Should deploy and wire full protocol", async () => {
    // Deploy all contracts
    const token = await hre.viem.deployContract("RatherToken", [
      "Rather",
      "RATHER",
      parseEther("1000000"),
    ]);

    const nft = await hre.viem.deployContract("RatherNFT", [
      "RatherNFT",
      "RNFT",
      "ipfs://base/",
      0n,
    ]);

    const marketplace = await hre.viem.deployContract("RatherMarketplace", [
      nft.address,
    ]);

    const pool = await hre.viem.deployContract("RatherLiquidityPool", [
      token.address,
    ]);

    const treasury = await hre.viem.deployContract("RatherTreasury", [
      token.address,
      nft.address,
    ]);

    // Wire contracts
    await marketplace.write.setTreasury([treasury.address]);
    await pool.write.setTreasury([treasury.address]);
    await treasury.write.setMarketplace([marketplace.address]);
    await treasury.write.setLiquidityPool([pool.address]);
    await token.write.setTreasury([treasury.address]);

    // Verify wiring
    expect(await marketplace.read.treasury()).to.equal(treasury.address);
    expect(await pool.read.treasury()).to.equal(treasury.address);
  });
});
