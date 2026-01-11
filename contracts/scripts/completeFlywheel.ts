import { ethers } from "ethers";

const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
const provider = new ethers.JsonRpcProvider(rpcUrl);
const privateKey = process.env.SEPOLIA_PRIVATE_KEY!;
const signer = new ethers.Wallet(privateKey, provider);

// Contract addresses
const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
const TREASURY_ADDRESS = "0x0C2E07642E850A088585bC9c39c5287535eeB634";
const MARKETPLACE_ADDRESS = "0x9fCF4af886D2A8200B499297b7626895E2cCf3C3";
const TOKEN_ADDRESS = "0xd4D791861574EfB476d4fFe4F99062B267C434f8";

const poolAbi = ["function swapEthForRather() external payable"];
const treasuryAbi = [
  "function checkAndSweep() external",
  "function getTreasuryStats() external view returns (uint256, uint256, uint256, uint256)",
];
const marketplaceAbi = [
  "function getFloorPrice() public view returns (uint256, uint256)",
  "function buyNFT(uint256 tokenId) external payable",
];
const tokenAbi = ["function totalBurned() public view returns (uint256)"];

async function completeFlywheel() {
  console.log("🔄 COMPLETING FULL FLYWHEEL CYCLE\n");
  console.log("═".repeat(60));

  const pool = new ethers.Contract(POOL_ADDRESS, poolAbi, signer);
  const treasury = new ethers.Contract(TREASURY_ADDRESS, treasuryAbi, signer);
  const marketplace = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    marketplaceAbi,
    signer
  );
  const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

  // Step 1: Check current state
  console.log("\n📊 CURRENT STATE:");
  const [total1, op1, burn1] = await treasury.getTreasuryStats();
  const [floor1, floorId1] = await marketplace.getFloorPrice();
  const burned1 = await token.totalBurned();

  console.log(`  Treasury Operational Balance: ${ethers.formatEther(op1)} ETH`);
  console.log(`  Floor Price: ${ethers.formatEther(floor1)} ETH`);
  console.log(`  Total RATHER Burned: ${ethers.formatEther(burned1)}`);
  console.log(
    `  Need: ${ethers.formatEther(floor1 - op1)} ETH more to trigger sweep`
  );

  // Step 2: Do multiple swaps to reach threshold
  const swapsNeeded = Math.ceil(
    Number(floor1 - op1) / Number(ethers.parseEther("0.0005"))
  );
  console.log(`\n💰 DOING ${swapsNeeded + 1} SWAPS TO REACH THRESHOLD...`);

  for (let i = 0; i < swapsNeeded + 1; i++) {
    const swapAmount = ethers.parseEther("0.005");
    console.log(
      `\n  Swap ${i + 1}/${swapsNeeded + 1}: Sending ${ethers.formatEther(
        swapAmount
      )} ETH...`
    );
    const tx = await pool.swapEthForRather({ value: swapAmount });
    await tx.wait();
    console.log(`    ✅ Complete (fee sent to treasury: ~0.0005 ETH)`);

    // Check treasury balance
    const [, opBalance] = await treasury.getTreasuryStats();
    console.log(`    Treasury now has: ${ethers.formatEther(opBalance)} ETH`);

    if (opBalance >= floor1) {
      console.log(`    🎉 THRESHOLD REACHED!`);
      break;
    }
  }

  // Step 3: Trigger sweep
  console.log("\n🤖 TRIGGERING TREASURY SWEEP...");
  try {
    const sweepTx = await treasury.checkAndSweep();
    const sweepReceipt = await sweepTx.wait();
    console.log(`✅ Sweep executed! (tx: ${sweepReceipt?.hash})`);
    console.log("  📦 Treasury bought floor NFT and relisted at 10% premium");
  } catch (error) {
    console.log(
      "❌ Sweep failed (might be in cooldown or insufficient balance)"
    );
    console.log(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
  }

  // Step 4: Check new state
  console.log("\n📊 STATE AFTER SWEEP:");
  const [total2, op2, burn2] = await treasury.getTreasuryStats();
  const [floor2, floorId2] = await marketplace.getFloorPrice();

  console.log(`  Treasury Operational Balance: ${ethers.formatEther(op2)} ETH`);
  console.log(
    `  New Floor Price: ${ethers.formatEther(floor2)} ETH (Token #${floorId2})`
  );
  console.log(
    `  Burnable Balance (from future sales): ${ethers.formatEther(burn2)} ETH`
  );
  console.log(
    `  Premium: ${(
      ((Number(floor2) - Number(floor1)) / Number(floor1)) *
      100
    ).toFixed(1)}%`
  );

  // Step 5: Simulate someone buying the relisted NFT
  console.log("\n🛒 SIMULATING BUYER PURCHASING RELISTED NFT...");
  try {
    const buyTx = await marketplace.buyNFT(floorId2, { value: floor2 });
    const buyReceipt = await buyTx.wait();
    console.log(`✅ NFT purchased! (tx: ${buyReceipt?.hash})`);
    console.log("  💰 Treasury received sale proceeds");
  } catch (error) {
    console.log("⚠️  Couldn't buy (might need to wait or NFT already sold)");
  }

  // Step 6: Final stats
  console.log("\n📊 FINAL STATE:");
  const [total3, op3, burn3] = await treasury.getTreasuryStats();
  const burned2 = await token.totalBurned();

  console.log(`  Treasury Total Balance: ${ethers.formatEther(total3)} ETH`);
  console.log(`  Operational Balance: ${ethers.formatEther(op3)} ETH`);
  console.log(`  Burnable Balance: ${ethers.formatEther(burn3)} ETH`);
  console.log(`  Total RATHER Burned: ${ethers.formatEther(burned2)}`);
  console.log(
    `  New Tokens Burned: ${ethers.formatEther(burned2 - burned1)} RATHER`
  );

  console.log("\n🎉 FULL FLYWHEEL CYCLE COMPLETE!");
  console.log("═".repeat(60));
}

completeFlywheel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
