import { ethers } from "ethers";

/**
 * Diagnose and fix the pool state mismatch
 * Run with: npx hardhat run scripts/fixPoolState.ts --network arbitrumSepolia
 */
async function main() {
  const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
  const TOKEN_ADDRESS = "0xd4D791861574EfB476d4fFe4F99062B267C434f8";
  const PRIVATE_KEY = "";

  const rpcUrl = "https://arbitrum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("\n=== POOL STATE DIAGNOSTIC ===\n");
  console.log("Signer:", signer.address);
  console.log("Pool:", POOL_ADDRESS);
  console.log("Token:", TOKEN_ADDRESS);

  const poolAbi = [
    "function ethReserve() view returns (uint256)",
    "function ratherReserve() view returns (uint256)",
    "function addLiquidity(uint256 ratherAmount) external payable",
  ];

  const tokenAbi = [
    "function balanceOf(address account) public view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
  ];

  const poolContract = new ethers.Contract(POOL_ADDRESS, poolAbi, provider);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

  try {
    // Check current state
    const ethReserve = await poolContract.ethReserve();
    const ratherReserve = await poolContract.ratherReserve();

    const tokenContractRead = new ethers.Contract(
      TOKEN_ADDRESS,
      tokenAbi,
      provider
    );
    const poolTokenBalance = await tokenContractRead.balanceOf(POOL_ADDRESS);

    console.log("\n📊 CURRENT STATE:");
    console.log(`  ETH Reserve (state): ${ethers.formatEther(ethReserve)} ETH`);
    console.log(
      `  RATHER Reserve (state): ${ethers.formatEther(ratherReserve)} RATHER`
    );
    console.log(
      `  Pool Token Balance (actual): ${ethers.formatEther(
        poolTokenBalance
      )} RATHER`
    );

    if (
      BigInt(ratherReserve) === BigInt(0) &&
      BigInt(poolTokenBalance) > BigInt(0)
    ) {
      console.log("\n❌ ISSUE DETECTED:");
      console.log("   State variables are 0, but pool holds tokens!");
      console.log(
        "   This means addLiquidity was called with 0 amounts or failed partway through."
      );

      console.log("\n🔧 FIXING:");
      console.log("   Need to re-call addLiquidity to sync state variables...");

      // Check signer's token balance
      const signerTokenBalance = await tokenContract.balanceOf(signer.address);
      console.log(
        `\n   Signer RATHER balance: ${ethers.formatEther(
          signerTokenBalance
        )} RATHER`
      );

      // Get signer's ETH balance
      const signerEthBalance = await provider.getBalance(signer.address);
      console.log(
        `   Signer ETH balance: ${ethers.formatEther(signerEthBalance)} ETH`
      );

      if (BigInt(signerTokenBalance) > BigInt(0)) {
        console.log("\n✅ Signer has RATHER tokens - can fix!");
        console.log(
          "   Run: npx hardhat run scripts/addLiquidity.ts --network arbitrumSepolia"
        );
      } else {
        console.log("\n⚠️  Signer has no RATHER tokens - need to mint first!");
        console.log("   Or transfer RATHER tokens to signer address.");
      }
    } else if (BigInt(ratherReserve) > BigInt(0)) {
      console.log("\n✅ Pool state looks correct!");
    } else {
      console.log("\n❌ Pool is empty - needs liquidity!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
