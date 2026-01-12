"use client";

import { useState, useEffect } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import { getSigner, getProvider } from "@/lib/ethers-config";
import { CONTRACTS, MARKETPLACE_ABI, NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/lib/toast";

export default function MarketplacePage() {
  const { address, isConnected } = useWallet();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [activeListings, setActiveListings] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchListings = async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(
        CONTRACTS.RatherMarketplace,
        MARKETPLACE_ABI,
        provider
      );
      const listings = await contract.getActiveListings();
      setActiveListings(listings);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async () => {
    if (!listTokenId) return;

    try {
      const signer = await getSigner();
      const nftContract = new Contract(CONTRACTS.RatherNFT, NFT_ABI, signer);

      const tx = await nftContract.approve(
        CONTRACTS.RatherMarketplace,
        BigInt(listTokenId)
      );
      addToast("⏳ Approving NFT...", "info");
      await tx.wait();
      addToast("✅ NFT approved!", "success");
    } catch (err: unknown) {
      const errMsg = (err as { message?: string }).message || "Unknown error";
      console.error("Approve failed:", err);

      if (errMsg.includes("denied") || errMsg.includes("rejected")) {
        addToast("❌ Transaction rejected by user", "warning");
      } else if (errMsg.includes("insufficient")) {
        addToast("❌ Insufficient balance", "error");
      } else {
        addToast(`❌ Approve failed: ${errMsg.substring(0, 60)}`, "error");
      }
    }
  };

  const handleList = async () => {
    if (!listTokenId || !listPrice) return;

    try {
      const signer = await getSigner();
      const contract = new Contract(
        CONTRACTS.RatherMarketplace,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.listNFT(
        BigInt(listTokenId),
        parseEther(listPrice)
      );
      addToast("⏳ Listing NFT...", "info");
      await tx.wait();

      addToast("✅ NFT listed successfully!", "success");
      setListTokenId("");
      setListPrice("");
      fetchListings();
    } catch (err: unknown) {
      const errMsg = (err as { message?: string }).message || "Unknown error";
      console.error("Listing failed:", err);

      if (errMsg.includes("denied") || errMsg.includes("rejected")) {
        addToast("❌ Transaction rejected by user", "warning");
      } else if (errMsg.includes("insufficient")) {
        addToast("❌ Insufficient balance or not approved", "error");
      } else {
        addToast(`❌ Listing failed: ${errMsg.substring(0, 60)}`, "error");
      }
    }
  };

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    try {
      const signer = await getSigner();
      const contract = new Contract(
        CONTRACTS.RatherMarketplace,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.buyNFT(tokenId, { value: price });
      addToast("⏳ Purchasing NFT...", "info");
      await tx.wait();

      addToast("✅ NFT purchased successfully!", "success");
      fetchListings();
    } catch (err: unknown) {
      const errMsg = (err as { message?: string }).message || "Unknown error";
      console.error("Purchase failed:", err);

      if (errMsg.includes("denied") || errMsg.includes("rejected")) {
        addToast("❌ Transaction rejected by user", "warning");
      } else if (errMsg.includes("insufficient")) {
        addToast("❌ Insufficient balance", "error");
      } else {
        addToast(`❌ Purchase failed: ${errMsg.substring(0, 60)}`, "error");
      }
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card text-center">
          <h1 className="text-3xl font-bold text-brown-800 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-brown-600">
            Please connect your wallet to access the marketplace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-brown-800 mb-4">
        NFT Marketplace
      </h1>
      <p className="text-brown-600 mb-8">
        List your NFTs for sale or buy NFTs from other users
      </p>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* List NFT Section */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            List Your NFT
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-brown-800 font-semibold mb-2">
                Token ID
              </label>
              <input
                type="number"
                value={listTokenId}
                onChange={(e) => setListTokenId(e.target.value)}
                placeholder="0"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-brown-800 font-semibold mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="0.0"
                className="input w-full"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                disabled={!listTokenId}
                className="btn-secondary flex-1"
              >
                1. Approve
              </button>

              <button
                onClick={handleList}
                disabled={!listTokenId || !listPrice}
                className="btn-primary flex-1"
              >
                2. List NFT
              </button>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Active Listings ({activeListings.length})
          </h2>

          {isLoading ? (
            <div className="text-center text-brown-600">Loading...</div>
          ) : activeListings.length === 0 ? (
            <div className="text-center text-brown-600">
              No active listings yet
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeListings.map((tokenId) => (
                <ListingCard
                  key={tokenId.toString()}
                  tokenId={tokenId}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingCard({
  tokenId,
  onBuy,
}: {
  tokenId: bigint;
  onBuy: (tokenId: bigint, price: bigint) => void;
}) {
  const [listing, setListing] = useState<{
    price: bigint;
    seller: string;
    active: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const provider = getProvider();
        const contract = new Contract(
          CONTRACTS.RatherMarketplace,
          MARKETPLACE_ABI,
          provider
        );
        const data = await contract.listings(tokenId);
        setListing({
          price: data[0],
          seller: data[1],
          active: data[2],
        });
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      }
    };

    fetchListing();
  }, [tokenId]);

  if (!listing || !listing.active) return null;

  return (
    <div className="p-4 bg-cream-50 rounded-lg flex justify-between items-center">
      <div>
        <div className="font-semibold text-brown-800">
          Token #{tokenId.toString()}
        </div>
        <div className="text-sm text-brown-600">
          {formatEther(listing.price).substring(0, 8)} ETH
        </div>
        <div className="text-xs text-brown-500">
          Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
        </div>
      </div>
      <button
        onClick={() => onBuy(tokenId, listing.price)}
        className="btn-primary text-sm px-4 py-2"
      >
        Buy
      </button>
    </div>
  );
}
