import { ethers } from "ethers";

async function main() {
  // Create provider and signer
  const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("SEPOLIA_PRIVATE_KEY not set in environment");
  }

  const signer = new ethers.Wallet(privateKey, provider);

  console.log("Adding liquidity with account:", signer.address);

  // Deployed addresses
  const TOKEN_ADDRESS = "0xd4D791861574EfB476d4fFe4F99062B267C434f8";
  const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";

  // Load ABIs
  const tokenAbi = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
  ];

  const poolAbi = [
    "function addLiquidity(uint256 ratherAmount) external payable",
    "function ethReserve() public view returns (uint256)",
    "function ratherReserve() public view returns (uint256)",
  ];

  // Get contract instances
  const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
  const pool = new ethers.Contract(POOL_ADDRESS, poolAbi, signer);

  // Amounts
  const ethAmount = ethers.parseEther("0.01"); // 0.01 ETH
  const ratherAmount = ethers.parseEther("10000"); // 10,000 RATHER

  console.log("\n📊 Adding liquidity:");
  console.log(`  ETH: ${ethers.formatEther(ethAmount)}`);
  console.log(`  RATHER: ${ethers.formatEther(ratherAmount)}`);

  // 1. Check RATHER balance
  const balance = await token.balanceOf(signer.address);
  console.log(`  Your RATHER balance: ${ethers.formatEther(balance)}`);

  if (balance < ratherAmount) {
    console.error("❌ Insufficient RATHER balance!");
    console.error(
      `   Need: ${ethers.formatEther(ratherAmount)}, Have: ${ethers.formatEther(
        balance
      )}`
    );
    process.exit(1);
  }

  // 2. Approve RATHER tokens
  console.log("\n1️⃣ Approving RATHER tokens...");
  try {
    const approveTx = await token.approve(POOL_ADDRESS, ratherAmount);
    const approveReceipt = await approveTx.wait();
    console.log(`✅ Approved (tx: ${approveReceipt?.hash})`);
  } catch (error) {
    console.error("❌ Approval failed:", error);
    process.exit(1);
  }

  // 3. Add liquidity
  console.log("\n2️⃣ Adding liquidity to pool...");
  try {
    const addLiquidityTx = await pool.addLiquidity(ratherAmount, {
      value: ethAmount,
    });
    const liquidityReceipt = await addLiquidityTx.wait();
    console.log(`✅ Liquidity added! (tx: ${liquidityReceipt?.hash})`);
  } catch (error) {
    console.error("❌ Adding liquidity failed:", error);
    process.exit(1);
  }

  // 4. Check reserves
  const ethReserve = await pool.ethReserve();
  const ratherReserve = await pool.ratherReserve();

  console.log("\n📈 Pool Status:");
  console.log(`  ETH Reserve: ${ethers.formatEther(ethReserve)}`);
  console.log(`  RATHER Reserve: ${ethers.formatEther(ratherReserve)}`);

  if (ethReserve > 0n) {
    const price = Number(ratherReserve) / Number(ethReserve);
    console.log(`  Initial Price: 1 ETH = ${price.toFixed(2)} RATHER`);
  }

  console.log("\n✨ Liquidity setup complete! The pool is ready for swaps.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
