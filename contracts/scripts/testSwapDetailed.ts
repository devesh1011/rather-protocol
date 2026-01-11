import { ethers } from "ethers";

/**
 * Direct test of swap to diagnose the "Decoding failed" error
 * Run with: npx hardhat run scripts/testSwapDetailed.ts --network arbitrumSepolia
 */
async function main() {
  const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
  const PRIVATE_KEY = "";

  const rpcUrl = "https://arbitrum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("\n=== DETAILED SWAP TEST ===\n");
  console.log("Signer:", signer.address);
  console.log("Pool:", POOL_ADDRESS);

  // Use string-based ABI (same as frontend)
  const POOL_ABI = [
    "function swapEthForRather() payable",
    "function getRatherOut(uint256 ethIn) view returns (uint256)",
    "function ethReserve() view returns (uint256)",
    "function ratherReserve() view returns (uint256)",
    "event Swapped(address indexed user, bool isEthForRather, uint256 amountIn, uint256 amountOut, uint256 fee)",
  ];

  const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);

  try {
    // Test parameters
    const ethAmount = ethers.parseEther("0.001");
    console.log(`\n1. Testing with ${ethers.formatEther(ethAmount)} ETH`);

    // Check reserves first
    const ethReserve = await pool.ethReserve();
    const ratherReserve = await pool.ratherReserve();
    console.log(`   ETH Reserve: ${ethers.formatEther(ethReserve)}`);
    console.log(`   RATHER Reserve: ${ethers.formatEther(ratherReserve)}`);

    // Calculate expected output
    const expectedOut = await pool.getRatherOut(ethAmount);
    console.log(
      `   Expected output: ${ethers.formatEther(expectedOut)} RATHER`
    );

    // Try to estimate gas
    console.log(`\n2. Estimating gas...`);
    try {
      const gasEstimate = await signer.estimateGas({
        to: POOL_ADDRESS,
        data: pool.interface.encodeFunctionData("swapEthForRather"),
        value: ethAmount,
      });
      console.log(`   Gas estimate: ${gasEstimate.toString()}`);
    } catch (gasErr) {
      console.log(`   ⚠️ Gas estimation failed:`, (gasErr as any).message);
    }

    // Send transaction
    console.log(`\n3. Sending swap transaction...`);
    const tx = await pool.swapEthForRather({ value: ethAmount });
    console.log(`   Transaction hash: ${tx.hash}`);

    // Wait for receipt
    console.log(`\n4. Waiting for confirmation...`);
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    console.log(`   Block number: ${receipt?.blockNumber}`);
    console.log(`   Gas used: ${receipt?.gasUsed.toString()}`);
    console.log(
      `   Status: ${receipt?.status === 1 ? "✅ SUCCESS" : "❌ FAILED"}`
    );

    if (receipt?.logs && receipt.logs.length > 0) {
      console.log(`   Logs: ${receipt.logs.length} event(s) emitted`);
    }

    console.log(`\n✅ Swap completed successfully!`);
    console.log(`   Check your balance and Arbiscan for confirmation.`);
  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error("   Name:", (error as any).name);
    console.error("   Code:", (error as any).code);
    console.error("   Message:", (error as any).message);

    if ((error as any).data) {
      console.error("   Data:", (error as any).data);
    }

    if ((error as any).transaction) {
      console.error("   Transaction:", {
        to: (error as any).transaction.to,
        data: (error as any).transaction.data,
        value: (error as any).transaction.value?.toString(),
      });
    }

    // Try to decode error
    try {
      const iface = new ethers.Interface([
        "error NoETHSent()",
        "error NoLiquidity()",
        "error InsufficientLiquidity()",
      ]);

      if ((error as any).data) {
        const decoded = iface.parseError((error as any).data);
        console.log("   Decoded error:", decoded?.name);
      }
    } catch {
      // Couldn't decode, that's ok
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
