"use client";

import { useState, useEffect } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import { getSigner, getProvider } from "@/lib/ethers-config";
import { CONTRACTS, POOL_ABI } from "@/lib/contracts";
import { useToast } from "@/lib/toast";
import { PoolDiagnostics } from "@/components/PoolDiagnostics";

export default function SwapPage() {
  const { isConnected, address } = useWallet();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState("");
  const [expectedRather, setExpectedRather] = useState("0");
  const [ethReserve, setEthReserve] = useState("0");
  const [ratherReserve, setRatherReserve] = useState("0");
  const [poolBalance, setPoolBalance] = useState("0");
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch pool data
  const fetchPoolData = async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        provider
      );

      const [eth, rather] = await Promise.all([
        contract.ethReserve(),
        contract.ratherReserve(),
      ]);

      setEthReserve(formatEther(eth));
      setRatherReserve(formatEther(rather));
      setPoolBalance(formatEther(rather)); // Pool balance = rather reserve
    } catch (err) {
      console.error("Failed to fetch pool data:", err);
    }
  };

  // Calculate expected RATHER output
  const calculateOutput = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setExpectedRather("0");
      return;
    }

    try {
      const provider = getProvider();
      const contract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        provider
      );

      const amountIn = parseEther(ethAmount);
      const fee = (amountIn * BigInt(10)) / BigInt(100); // 10% fee
      const amountAfterFee = amountIn - fee;

      const output = await contract.getRatherOut(amountAfterFee);
      setExpectedRather(formatEther(output));
    } catch (err) {
      console.error("Failed to calculate output:", err);
      setExpectedRather("0");
    }
  };

  useEffect(() => {
    fetchPoolData();
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateOutput();
  }, [ethAmount]);

  const handleSwap = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      addToast("Please enter a valid ETH amount", "warning");
      return;
    }

    if (!address) {
      addToast("Please connect your wallet", "warning");
      return;
    }

    setIsPending(true);

    try {
      const signer = await getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Signer address:", signerAddress);

      const contract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        signer
      );

      const value = parseEther(ethAmount);

      console.log("Swapping", ethAmount, "ETH for RATHER");
      console.log("Value in wei:", value.toString());

      // Estimate gas first to catch errors early
      try {
        const gasEstimate = await contract.swapEthForRather.estimateGas({
          value,
        });
        console.log("Gas estimate successful:", gasEstimate.toString());
      } catch (estimateErr: unknown) {
        const errMsg =
          (estimateErr as { message?: string }).message || "Unknown";
        console.error("Gas estimation failed:", estimateErr);
        throw new Error(`Gas estimation failed: ${errMsg}`);
      }

      const tx = await contract.swapEthForRather({
        value,
        gasLimit: 200000,
      });

      setIsPending(false);
      setIsConfirming(true);

      addToast(
        "⏳ Transaction sent! Waiting for confirmation...",
        "info",
        5000
      );

      const receipt = await tx.wait();

      setIsConfirming(false);

      addToast(
        `✅ Swapped successfully! Received ${parseFloat(expectedRather).toFixed(
          4
        )} RATHER`,
        "success",
        5000
      );

      console.log("Swap successful:", receipt.hash);

      // Reset and refresh
      setEthAmount("");
      fetchPoolData();
    } catch (err: unknown) {
      console.error("Swap failed:", err);
      setIsPending(false);
      setIsConfirming(false);

      const errorMessage =
        (err as { message?: string }).message || "Swap failed";
      const fullError = JSON.stringify(err);

      console.error("Full error object:", fullError);

      if (errorMessage.includes("user rejected")) {
        addToast("❌ Transaction rejected by user", "warning", 4000);
      } else if (errorMessage.includes("insufficient")) {
        addToast("❌ Insufficient balance or liquidity", "error", 4000);
      } else if (errorMessage.includes("Decoding failed")) {
        addToast(
          "⚠️ Transaction may have failed - checking on-chain status...",
          "warning",
          5000
        );
      } else {
        addToast(
          `❌ Swap failed: ${errorMessage.substring(0, 80)}`,
          "error",
          4000
        );
      }
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center">
          <h1 className="text-3xl font-bold text-brown-800 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-brown-600 mb-4">
            Please connect your wallet to access the swap
          </p>
          <p className="text-sm text-brown-500">
            💡 Click "Connect Wallet" in the top right corner
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-brown-800 mb-4">
        Swap ETH ↔ RATHER
      </h1>
      <p className="text-brown-600 mb-8">
        Swap between ETH and RATHER tokens using the liquidity pool
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Swap Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Swap ETH for RATHER
          </h2>

          <div className="mb-6">
            <label className="block text-brown-800 font-semibold mb-2">
              ETH Amount
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.0"
              className="input w-full"
            />
          </div>

          {ethAmount && parseFloat(ethAmount) > 0 && (
            <div className="mb-6 p-4 bg-cream-100 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-brown-600">You will receive:</span>
                <span className="text-brown-800 font-semibold">
                  ~{parseFloat(expectedRather).toFixed(4)} RATHER
                </span>
              </div>
              <div className="flex justify-between text-xs text-brown-500 mt-1">
                <span>Fee (10%):</span>
                <span>{(parseFloat(ethAmount) * 0.1).toFixed(4)} ETH</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSwap}
            disabled={
              !mounted ||
              !isConnected ||
              isPending ||
              isConfirming ||
              !ethAmount ||
              parseFloat(ethAmount) <= 0 ||
              parseFloat(ratherReserve) === 0
            }
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!mounted
              ? "Loading..."
              : !isConnected
              ? "Connect Wallet"
              : isPending
              ? "Preparing..."
              : isConfirming
              ? "Swapping..."
              : "Swap"}
          </button>
        </div>

        {/* Pool Info */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Pool Information
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-600">ETH Reserve:</span>
              <span className="text-brown-800 font-semibold">
                {parseFloat(ethReserve).toFixed(4)} ETH
              </span>
            </div>

            <div className="flex justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-600">RATHER Reserve:</span>
              <span className="text-brown-800 font-semibold">
                {parseFloat(ratherReserve).toFixed(2)} RATHER
              </span>
            </div>

            <div className="flex justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-600">Pool Balance:</span>
              <span className="text-brown-800 font-semibold">
                {parseFloat(poolBalance).toFixed(2)} RATHER
              </span>
            </div>

            <div className="pt-4 border-t border-cream-200">
              <div className="text-sm text-brown-600 mb-2">Pool Status:</div>
              <div className="text-lg font-semibold text-green-600">
                {parseFloat(ratherReserve) > 0
                  ? "✅ HEALTHY - Pool ready for swaps"
                  : "⚠️ NO LIQUIDITY"}
              </div>
            </div>

            <button
              onClick={fetchPoolData}
              className="btn-secondary w-full text-sm"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <PoolDiagnostics />
    </div>
  );
}
