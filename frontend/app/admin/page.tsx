"use client";

import { useState, useEffect } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import { getSigner, getProvider } from "@/lib/ethers-config";
import { CONTRACTS, POOL_ABI, TREASURY_ABI, TOKEN_ABI } from "@/lib/contracts";

export default function AdminPage() {
  const { address, isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState("");
  const [ratherAmount, setRatherAmount] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddLiquidity = async () => {
    if (!ethAmount || !ratherAmount) return;

    try {
      const signer = await getSigner();

      // Approve RATHER
      const tokenContract = new Contract(
        CONTRACTS.RatherToken,
        TOKEN_ABI,
        signer
      );
      const approveTx = await tokenContract.approve(
        CONTRACTS.RatherLiquidityPool,
        parseEther(ratherAmount)
      );
      await approveTx.wait();

      // Add liquidity
      const poolContract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        signer
      );
      const tx = await poolContract.addLiquidity(parseEther(ratherAmount), {
        value: parseEther(ethAmount),
      });
      await tx.wait();

      alert("Liquidity added!");
      setEthAmount("");
      setRatherAmount("");
    } catch (err) {
      console.error("Failed to add liquidity:", err);
      alert("Failed to add liquidity");
    }
  };

  const handleSetTreasury = async () => {
    if (!treasuryAddress) return;

    try {
      const signer = await getSigner();
      const poolContract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        signer
      );

      const tx = await poolContract.setTreasury(treasuryAddress);
      await tx.wait();

      alert("Treasury address updated!");
      setTreasuryAddress("");
    } catch (err) {
      console.error("Failed to set treasury:", err);
      alert("Failed to set treasury");
    }
  };

  const handleManualBuyAndBurn = async () => {
    try {
      const signer = await getSigner();
      const treasuryContract = new Contract(
        CONTRACTS.RatherTreasury,
        TREASURY_ABI,
        signer
      );

      const tx = await treasuryContract.manualBuyAndBurn();
      await tx.wait();

      alert("Buy and burn executed!");
    } catch (err) {
      console.error("Failed to execute buy and burn:", err);
      alert("Failed to execute buy and burn");
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="animate-pulse">Loading...</div>
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
          <p className="text-brown-600">
            Please connect your wallet to access admin functions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-brown-800 mb-4">Admin Panel</h1>
      <p className="text-brown-600 mb-8">
        Manage liquidity pool and treasury (owner only)
      </p>

      <div className="space-y-8">
        {/* Add Liquidity */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Add Liquidity
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-brown-800 font-semibold mb-2">
                ETH Amount
              </label>
              <input
                type="number"
                step="0.001"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-brown-800 font-semibold mb-2">
                RATHER Amount
              </label>
              <input
                type="number"
                step="1"
                value={ratherAmount}
                onChange={(e) => setRatherAmount(e.target.value)}
                placeholder="0"
                className="input w-full"
              />
            </div>

            <button
              onClick={handleAddLiquidity}
              disabled={!ethAmount || !ratherAmount}
              className="btn-primary w-full"
            >
              Add Liquidity
            </button>
          </div>
        </div>

        {/* Set Treasury */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Set Treasury Address
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-brown-800 font-semibold mb-2">
                Treasury Address
              </label>
              <input
                type="text"
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
                placeholder="0x..."
                className="input w-full"
              />
            </div>

            <button
              onClick={handleSetTreasury}
              disabled={!treasuryAddress}
              className="btn-primary w-full"
            >
              Update Treasury
            </button>
          </div>
        </div>

        {/* Manual Buy and Burn */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-brown-800 mb-6">
            Treasury Actions
          </h2>

          <button
            onClick={handleManualBuyAndBurn}
            className="btn-primary w-full"
          >
            Execute Manual Buy & Burn
          </button>

          <p className="text-sm text-brown-600 mt-4">
            This will use treasury funds to buy and burn RATHER tokens
          </p>
        </div>
      </div>
    </div>
  );
}
