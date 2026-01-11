import hre from "hardhat";
import { getAddress } from "viem";

async function main() {
  const provider = hre.ethers.provider;
  const networkId = (await provider.getNetwork()).chainId;
  console.log("Network Chain ID:", networkId);
  
  const accounts = await hre.ethers.getSigners();
  if (accounts.length === 0) {
    console.error("No accounts found! Check DEPLOYER_PRIVATE_KEY in .env");
    return;
  }
  
  const account = accounts[0];
  const address = await account.getAddress();
  console.log("Account address:", address);
  
  const balance = await provider.getBalance(address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
