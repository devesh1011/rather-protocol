import { ethers } from "ethers";

const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
const provider = new ethers.JsonRpcProvider(rpcUrl);
const privateKey = process.env.SEPOLIA_PRIVATE_KEY!;
const signer = new ethers.Wallet(privateKey, provider);

// Contract addresses
const NFT_ADDRESS = "0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac";
const TOKEN_ADDRESS = "0xd4D791861574EfB476d4fFe4F99062B267C434f8";
const MARKETPLACE_ADDRESS = "0x9fCF4af886D2A8200B499297b7626895E2cCf3C3";
const POOL_ADDRESS = "0xfc19E178a9c4C6637CA030Bc57b839b30f381889";
const TREASURY_ADDRESS = "0x0C2E07642E850A088585bC9c39c5287535eeB634";

const nftAbi = [
  "function mint(address to, string memory uri) public payable returns (uint256)",
  "function approve(address to, uint256 tokenId) public",
];

const marketplaceAbi = [
  "function listNFT(uint256 tokenId, uint256 price) external",
  "function buyNFT(uint256 tokenId) external payable",
  "function getFloorPrice() public view returns (uint256 floorPrice, uint256 floorTokenId)",
];

const poolAbi = [
  "function swapEthForRather() external payable",
  "function getRatherOut(uint256 ethIn) public view returns (uint256)",
];

const treasuryAbi = [
  "function checkAndSweep() external",
  "function getTreasuryStats() external view returns (uint256, uint256, uint256, uint256)",
];

async function testFlywheel() {
  console.log("🚀 Testing Rather Protocol Flywheel\n");
  console.log("Account:", signer.address);

  const nft = new ethers.Contract(NFT_ADDRESS, nftAbi, signer);
  const marketplace = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    marketplaceAbi,
    signer
  );
  const pool = new ethers.Contract(POOL_ADDRESS, poolAbi, signer);
  const treasury = new ethers.Contract(TREASURY_ADDRESS, treasuryAbi, signer);

  try {
    // Step 1: Mint NFT
    console.log("\n📝 Step 1: Minting NFT...");
    const mintTx = await nft.mint(signer.address, "ipfs://test/nft1");
    const mintReceipt = await mintTx.wait();
    console.log(`✅ NFT minted (tx: ${mintReceipt?.hash})`);

    // Step 2: List NFT on marketplace
    console.log("\n📝 Step 2: Approving marketplace...");
    const approveTx = await nft.approve(MARKETPLACE_ADDRESS, 0);
    await approveTx.wait();
    console.log(`✅ Marketplace approved`);

    console.log("\n📝 Step 2b: Listing NFT on marketplace at 0.01 ETH...");
    const listPrice = ethers.parseEther("0.01");
    const listTx = await marketplace.listNFT(0, listPrice);
    const listReceipt = await listTx.wait();
    console.log(`✅ NFT listed (tx: ${listReceipt?.hash})`);

    // Step 3: Swap ETH for RATHER (generates fee to treasury)
    console.log("\n📝 Step 3: Swapping 0.005 ETH for RATHER...");
    const swapAmount = ethers.parseEther("0.005");
    const expectedRather = await pool.getRatherOut(swapAmount);
    console.log(`  Expected RATHER out: ${ethers.formatEther(expectedRather)}`);

    const swapTx = await pool.swapEthForRather({ value: swapAmount });
    const swapReceipt = await swapTx.wait();
    console.log(`✅ Swapped (tx: ${swapReceipt?.hash})`);
    console.log(`  💰 Treasury received ~0.0005 ETH (10% fee)`);

    // Step 4: Check treasury status
    console.log("\n📝 Step 4: Checking treasury status...");
    const [totalBalance, opBalance, burnBalance, ratherBalance] =
      await treasury.getTreasuryStats();
    console.log(`  Total Balance: ${ethers.formatEther(totalBalance)} ETH`);
    console.log(`  Operational Balance: ${ethers.formatEther(opBalance)} ETH`);
    console.log(`  Burnable Balance: ${ethers.formatEther(burnBalance)} ETH`);

    // Step 5: Check if treasury can sweep
    const [floorPrice, floorTokenId] = await marketplace.getFloorPrice();
    console.log("\n📝 Step 5: Checking floor price...");
    console.log(
      `  Floor Price: ${ethers.formatEther(
        floorPrice
      )} ETH (Token #${floorTokenId})`
    );
    console.log(`  Treasury Balance: ${ethers.formatEther(opBalance)} ETH`);

    if (opBalance >= floorPrice) {
      console.log(
        `  ✅ Treasury can sweep! (${ethers.formatEther(
          opBalance
        )} >= ${ethers.formatEther(floorPrice)})`
      );

      // Step 6: Trigger sweep
      console.log("\n📝 Step 6: Triggering treasury sweep...");
      const sweepTx = await treasury.checkAndSweep();
      const sweepReceipt = await sweepTx.wait();
      console.log(`✅ Sweep executed (tx: ${sweepReceipt?.hash})`);
      console.log("  📍 Treasury bought NFT and relisted at 10% premium");
    } else {
      console.log(
        `  ❌ Cannot sweep yet. Need ${ethers.formatEther(
          floorPrice - opBalance
        )} ETH more.`
      );
    }

    // Step 7: Display final stats
    console.log("\n📊 Flywheel Test Complete!");
    console.log("═".repeat(50));

    const finalStats = await treasury.getTreasuryStats();
    console.log(
      `Treasury Final Balance: ${ethers.formatEther(finalStats[0])} ETH`
    );
    console.log(
      `Operational Balance: ${ethers.formatEther(finalStats[1])} ETH`
    );
    console.log(
      `Burnable Balance (from sales): ${ethers.formatEther(finalStats[2])} ETH`
    );
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

testFlywheel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
