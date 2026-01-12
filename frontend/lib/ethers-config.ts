import { BrowserProvider, JsonRpcProvider } from "ethers";

export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  name: "Arbitrum Sepolia",
  rpcUrl: "https://arbitrum-sepolia-rpc.publicnode.com",
  blockExplorer: "https://sepolia.arbiscan.io",
};

// Get provider (read-only)
export function getProvider() {
  return new JsonRpcProvider(ARBITRUM_SEPOLIA.rpcUrl);
}

// Get signer (connected wallet)
export async function getSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new BrowserProvider(window.ethereum);

  // Request account access
  await provider.send("eth_requestAccounts", []);

  // Check and switch to Arbitrum Sepolia if needed
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== ARBITRUM_SEPOLIA.chainId) {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${ARBITRUM_SEPOLIA.chainId.toString(16)}` },
      ]);
    } catch (error: unknown) {
      // Chain not added, add it
      if (error.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: `0x${ARBITRUM_SEPOLIA.chainId.toString(16)}`,
            chainName: ARBITRUM_SEPOLIA.name,
            rpcUrls: [ARBITRUM_SEPOLIA.rpcUrl],
            blockExplorerUrls: [ARBITRUM_SEPOLIA.blockExplorer],
          },
        ]);
      } else {
        throw error;
      }
    }
  }

  return provider.getSigner();
}

// Get current account
export async function getAccount(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    return accounts[0] || null;
  } catch {
    return null;
  }
}

// Check if connected
export async function isConnected(): Promise<boolean> {
  const account = await getAccount();
  return !!account;
}
