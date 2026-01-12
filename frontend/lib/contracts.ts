// Contract addresses on Arbitrum Sepolia
export const CONTRACTS = {
  RatherToken: "0xd4D791861574EfB476d4fFe4F99062B267C434f8",
  RatherNFT: "0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac",
  RatherMarketplace: "0x9fCF4af886D2A8200B499297b7626895E2cCf3C3",
  RatherLiquidityPool: "0xfc19E178a9c4C6637CA030Bc57b839b30f381889",
  RatherTreasury: "0x0C2E07642E850A088585bC9c39c5287535eeB634",
} as const;

// Owner/Deployer address (for admin access)
export const OWNER_ADDRESS = "0x2446C3FcA8234af53E719D77c387E54C34aD162E";

// ABIs for ethers.js
export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function totalBurned() view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const NFT_ABI = [
  "function mint(address to, string memory uri) payable returns (uint256)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
];

export const MARKETPLACE_ABI = [
  "function listNFT(uint256 tokenId, uint256 price)",
  "function buyNFT(uint256 tokenId) payable",
  "function cancelListing(uint256 tokenId)",
  "function getFloorPrice() view returns (uint256 floorPrice, uint256 floorTokenId)",
  "function getActiveListings() view returns (uint256[])",
  "function listings(uint256 tokenId) view returns (uint256 price, address seller, bool active)",
];

export const POOL_ABI = [
  "function swapEthForRather() payable",
  "function swapRatherForEth(uint256 ratherAmount)",
  "function getRatherOut(uint256 ethIn) view returns (uint256)",
  "function getEthOut(uint256 ratherIn) view returns (uint256)",
  "function ethReserve() view returns (uint256)",
  "function ratherReserve() view returns (uint256)",
  "function setTreasury(address _treasury)",
  "function addLiquidity(uint256 ratherAmount) payable",
  "event Swapped(address indexed user, bool isEthForRather, uint256 amountIn, uint256 amountOut, uint256 fee)",
];

export const TREASURY_ABI = [
  "function checkAndSweep()",
  "function manualBuyAndBurn()",
  "function getTreasuryStats() view returns (uint256 totalBalance, uint256 operationalBalance, uint256 burnBalance, uint256 ratherBalance)",
  "function minSweepThreshold() view returns (uint256)",
  "function lastSweepTime() view returns (uint256)",
] as const;
