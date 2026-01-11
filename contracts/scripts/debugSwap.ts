import { ethers } from "ethers";

async function main() {
  // Deployed contract addresses on Arbitrum Sepolia
  const RatherToken = "0xd4D791861574EfB476d4fFe4F99062B267C434f8";
  const RatherLiquidityPool = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
  const RatherTreasury = "0x0C2E07642E850A088585bC9c39c5287535eeB634";

  console.log("\n=== DEBUGGING SWAP ISSUE ===\n");
  console.log(`Pool Address: ${RatherLiquidityPool}`);
  console.log(`Token Address: ${RatherToken}\n`);

  const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const tokenContract = new ethers.Contract(
    RatherToken,
    [
      "function balanceOf(address account) public view returns (uint256)",
      "function allowance(address owner, address spender) public view returns (uint256)",
    ],
    provider
  );

  const poolContract = new ethers.Contract(
    RatherLiquidityPool,
    [
      "function ethReserve() public view returns (uint256)",
      "function ratherReserve() public view returns (uint256)",
      "function treasury() public view returns (address)",
    ],
    provider
  );

  try {
    // Check pool's RATHER balance
    const poolBalance = await tokenContract.balanceOf(RatherLiquidityPool);
    const ethReserve = await poolContract.ethReserve();
    const ratherReserve = await poolContract.ratherReserve();
    const treasury = await poolContract.treasury();

    console.log("📊 POOL STATE:");
    console.log(
      `  ETH Reserve (state variable): ${ethers.formatEther(ethReserve)} ETH`
    );
    console.log(
      `  RATHER Reserve (state variable): ${ethers.formatEther(
        ratherReserve
      )} RATHER`
    );
    console.log(
      `  Pool's RATHER Balance (actual tokens): ${ethers.formatEther(
        poolBalance
      )} RATHER`
    );
    console.log(`  Treasury Address: ${treasury}\n`);

    // Check for issues
    console.log("🔍 ISSUE DETECTION:");

    if (parseFloat(ethers.formatEther(poolBalance)) === 0) {
      console.log("  ❌ CRITICAL: Pool has 0 RATHER tokens!");
      console.log(
        "     → This is why swaps are failing with 'Decoding failed'"
      );
      console.log(
        "     → Need to run: npx hardhat run scripts/addLiquidity.ts"
      );
    } else if (BigInt(poolBalance) < BigInt(ratherReserve)) {
      console.log("  ⚠️  WARNING: Pool balance < Reserve!");
      console.log(
        `     → Difference: ${ethers.formatEther(
          BigInt(ratherReserve) - BigInt(poolBalance)
        )} RATHER`
      );
    } else {
      console.log("  ✅ Pool balance is sufficient for reserve amount");
    }

    if (treasury === "0x0000000000000000000000000000000000000000") {
      console.log("  ❌ Treasury not set! Swaps will fail.");
      console.log("     → This may also cause contract issues");
    } else {
      console.log(`  ✅ Treasury is set: ${treasury}`);
    }

    if (
      parseFloat(ethers.formatEther(ethReserve)) === 0 ||
      parseFloat(ethers.formatEther(ratherReserve)) === 0
    ) {
      console.log("  ❌ No liquidity in pool!");
    } else {
      console.log("  ✅ Pool has liquidity");
    }
  } catch (error) {
    console.error("❌ Error reading pool state:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
