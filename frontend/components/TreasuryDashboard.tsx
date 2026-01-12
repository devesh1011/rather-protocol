"use client";

import { useState, useEffect } from "react";
import { Contract, formatEther } from "ethers";
import { getProvider } from "@/lib/ethers-config";
import {
  CONTRACTS,
  TREASURY_ABI,
  MARKETPLACE_ABI,
  TOKEN_ABI,
} from "@/lib/contracts";

export function TreasuryDashboard() {
  const [treasuryStats, setTreasuryStats] = useState<
    [bigint, bigint, bigint, bigint]
  >([BigInt(0), BigInt(0), BigInt(0), BigInt(0)]);
  const [floorData, setFloorData] = useState<[bigint, bigint]>([
    BigInt(0),
    BigInt(0),
  ]);
  const [burnedAmount, setBurnedAmount] = useState<bigint>(BigInt(0));
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = async () => {
    try {
      const provider = getProvider();

      const treasuryContract = new Contract(
        CONTRACTS.RatherTreasury,
        TREASURY_ABI,
        provider
      );
      const marketplaceContract = new Contract(
        CONTRACTS.RatherMarketplace,
        MARKETPLACE_ABI,
        provider
      );
      const tokenContract = new Contract(
        CONTRACTS.RatherToken,
        TOKEN_ABI,
        provider
      );

      const [stats, floor, burned] = await Promise.all([
        treasuryContract.getTreasuryStats(),
        marketplaceContract.getFloorPrice(),
        tokenContract.totalBurned(),
      ]);

      setTreasuryStats(stats);
      setFloorData(floor);
      setBurnedAmount(burned);
      setLoadingStats(false);
    } catch (err) {
      console.error("Failed to fetch treasury data:", err);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loadingStats) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-cream-200 rounded w-3/4"></div>
          <div className="h-4 bg-cream-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [totalBalance, operationalBalance] = treasuryStats;
  const [floorPrice, floorTokenId] = floorData;

  const canSweep = floorPrice > BigInt(0) && operationalBalance >= floorPrice;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Treasury Balance */}
      <div className="card">
        <div className="text-sm text-brown-600 font-medium mb-2">
          Treasury Balance
        </div>
        <div className="text-3xl font-bold text-brown-800">
          {formatEther(totalBalance).substring(0, 7)} ETH
        </div>
        <div className="text-xs text-brown-600 mt-1">
          Operational: {formatEther(operationalBalance).substring(0, 7)} ETH
        </div>
      </div>

      {/* Floor Price */}
      <div className="card">
        <div className="text-sm text-brown-600 font-medium mb-2">
          Floor Price
        </div>
        <div className="text-3xl font-bold text-brown-800">
          {formatEther(floorPrice).substring(0, 7)} ETH
        </div>
        <div className="text-xs text-brown-600 mt-1">
          Token #{floorTokenId.toString()}
        </div>
      </div>

      {/* Sweep Status */}
      <div className="card">
        <div className="text-sm text-brown-600 font-medium mb-2">
          Sweep Status
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              canSweep ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <div className="text-xl font-bold text-brown-800">
            {canSweep ? "Ready" : "Not Ready"}
          </div>
        </div>
        <div className="text-xs text-brown-600 mt-1">
          {canSweep
            ? "Treasury can sweep floor"
            : `Need ${formatEther(
                BigInt(floorPrice) - BigInt(operationalBalance)
              ).substring(0, 6)} ETH more`}
        </div>
      </div>

      {/* Total Burned */}
      <div className="card">
        <div className="text-sm text-brown-600 font-medium mb-2">
          RATHER Burned 🔥
        </div>
        <div className="text-3xl font-bold text-brown-800">
          {burnedAmount
            ? Number(formatEther(burnedAmount as bigint)).toFixed(2)
            : "0"}
        </div>
        <div className="text-xs text-brown-600 mt-1">
          Deflationary mechanism active
        </div>
      </div>
    </div>
  );
}
