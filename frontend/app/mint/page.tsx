"use client";

import { useState, useEffect } from "react";
import { Contract } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import { getSigner } from "@/lib/ethers-config";
import { CONTRACTS, NFT_ABI } from "@/lib/contracts";

export default function MintPage() {
  const { isConnected, address } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [metadataURI, setMetadataURI] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadataURI.trim() || !address) return;

    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      const signer = await getSigner();
      const contract = new Contract(CONTRACTS.RatherNFT, NFT_ABI, signer);

      console.log("Minting NFT to:", address, "with URI:", metadataURI);

      const tx = await contract.mint(address, metadataURI, {
        gasLimit: 200000,
      });

      setIsPending(false);
      setIsConfirming(true);

      const receipt = await tx.wait();

      setIsConfirming(false);
      setIsSuccess(true);

      console.log("NFT minted! Transaction:", receipt.hash);

      // Reset form
      setMetadataURI("");
    } catch (err: any) {
      console.error("Minting failed:", err);
      setError(err.message || "Minting failed");
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-cream-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-cream-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card text-center">
          <h1 className="text-3xl font-bold text-brown-800 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-brown-600 mb-4">
            Please connect your wallet using the button above to mint NFTs
          </p>
          <p className="text-sm text-brown-500">
            💡 Click "Connect Wallet" in the top right corner
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-brown-800 mb-4">Mint NFT</h1>
      <p className="text-brown-600 mb-8">
        Create and mint your own Rather NFT for free
      </p>

      <form onSubmit={handleMint} className="card">
        <div className="mb-6">
          <label
            htmlFor="metadataURI"
            className="block text-brown-800 font-semibold mb-2"
          >
            Metadata URI
          </label>
          <input
            id="metadataURI"
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://... or https://..."
            className="input w-full"
            required
          />
          <p className="text-sm text-brown-600 mt-2">
            Enter the URI for your NFT metadata (IPFS or HTTP URL)
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !metadataURI.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Preparing..."
            : isConfirming
            ? "Minting..."
            : "Mint NFT"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-2xl">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-2xl">
            <p className="text-green-700 font-semibold mb-2">
              ✅ NFT Minted Successfully!
            </p>
            <p className="text-green-600 text-sm mt-2">
              Your NFT is ready! You can now list it on the marketplace.
            </p>
          </div>
        )}
      </form>

      <div className="card mt-8 bg-cream-100">
        <h3 className="font-semibold text-brown-800 mb-2">
          ℹ️ How to Prepare Metadata
        </h3>
        <ul className="text-sm text-brown-600 space-y-1">
          <li>• Upload your image and metadata JSON to IPFS</li>
          <li>• Use services like Pinata, NFT.Storage, or web3.storage</li>
          <li>• Metadata should follow ERC-721 standard format</li>
          <li>• Minting is free - you only pay gas fees</li>
        </ul>
      </div>
    </div>
  );
}
