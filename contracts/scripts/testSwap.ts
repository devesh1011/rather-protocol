import { ethers } from "ethers";

async function main() {
  // Deployed contract addresses
  const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
  const PRIVATE_KEY = "";

  const rpcUrl = "https://arbitrum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Testing swap with account:", signer.address);
  console.log("Pool address:", POOL_ADDRESS);

  const poolAbi = [
    {
      type: "function",
      name: "swapEthForRather",
      inputs: [],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "getRatherOut",
      inputs: [{ name: "ethIn", type: "uint256" }],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ];

  const poolContract = new ethers.Contract(POOL_ADDRESS, poolAbi, signer);

  try {
    // Test with 0.001 ETH
    const ethAmount = ethers.parseEther("0.001");
    console.log("\nTesting swap with:", ethers.formatEther(ethAmount), "ETH");

    // First, check what we'd get
    const getRatherOut = new ethers.Contract(POOL_ADDRESS, poolAbi, provider);
    const ratherOut = await getRatherOut.getRatherOut(ethAmount);
    console.log("Expected output:", ethers.formatEther(ratherOut), "RATHER");

    // Try the swap (don't send it)
    console.log("\nSimulating transaction...");
    const tx = await poolContract.swapEthForRather.populateTransaction({
      value: ethAmount,
    });

    console.log("Encoded function data:", tx.data);

    // Try to estimate gas
    try {
      const gasEstimate = await signer.estimateGas(tx);
      console.log("Gas estimate succeeded:", gasEstimate.toString());
    } catch (gasError) {
      console.log("Gas estimation failed:");
      console.log(gasError);
    }

    // Try to send the actual transaction
    console.log("\nSending transaction...");
    const result = await poolContract.swapEthForRather({ value: ethAmount });
    console.log("Transaction hash:", result.hash);

    const receipt = await result.wait();
    console.log("Transaction confirmed:", receipt?.transactionHash);
  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error("Message:", (error as any).message);
    console.error("Code:", (error as any).code);
    console.error("Method:", (error as any).method);
    console.error("Transaction:", (error as any).transaction);
    console.error("\nFull error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
