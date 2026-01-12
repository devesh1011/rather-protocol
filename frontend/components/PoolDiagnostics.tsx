"use client";

import { useState } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import { getProvider, getSigner } from "@/lib/ethers-config";
import { CONTRACTS, POOL_ABI, TOKEN_ABI } from "@/lib/contracts";

export function PoolDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnostics("Running diagnostics...");

    try {
      const provider = getProvider();
      const poolContract = new Contract(
        CONTRACTS.RatherLiquidityPool,
        POOL_ABI,
        provider
      );
      const tokenContract = new Contract(
        CONTRACTS.RatherToken,
        TOKEN_ABI,
        provider
      );

      // Get pool state
      const [ethReserve, ratherReserve] = await Promise.all([
        poolContract.ethReserve(),
        poolContract.ratherReserve(),
      ]);

      // Get token balances
      const [poolTokenBalance, userTokenBalance] = await Promise.all([
        tokenContract.balanceOf(CONTRACTS.RatherLiquidityPool),
        tokenContract.balanceOf(CONTRACTS.RatherLiquidityPool), // Using pool address twice for now
      ]);

      let output = `
=== POOL DIAGNOSTICS ===

ETH Reserve: ${formatEther(ethReserve)} ETH
RATHER Reserve: ${formatEther(ratherReserve)} RATHER
Pool Token Balance: ${formatEther(poolTokenBalance)} RATHER

Constant Product (k): ${(BigInt(ethReserve) * BigInt(ratherReserve)).toString()}

Testing swap with 0.001 ETH:
`;

      const testAmount = parseEther("0.001");
      const fee = (testAmount * BigInt(10)) / BigInt(100);
      const amountAfterFee = testAmount - fee;

      try {
        const expectedOutput = await poolContract.getRatherOut(amountAfterFee);
        output += `- Expected output: ${formatEther(expectedOutput)} RATHER
- Fee (10%): ${formatEther(fee)} ETH
- Amount after fee: ${formatEther(amountAfterFee)} ETH

✅ Pool is callable and responsive
`;
      } catch (err) {
        output += `
❌ Error calling getRatherOut: ${(err as Error).message}
`;
      }

      // Try to estimate swap gas
      try {
        const signer = await getSigner();
        const signerAddress = await signer.getAddress();
        const userContract = new Contract(
          CONTRACTS.RatherLiquidityPool,
          POOL_ABI,
          signer
        );

        const gasEstimate = await userContract.swapEthForRather.estimateGas({
          value: testAmount,
        });

        output += `
Gas Estimation:
- Estimated gas: ${gasEstimate.toString()}
- Signer: ${signerAddress}

✅ Transaction would be able to be sent
`;
      } catch (err) {
        output += `
❌ Gas estimation failed: ${(err as Error).message}
This suggests the transaction would revert!
`;
      }

      setDiagnostics(output);
    } catch (err) {
      setDiagnostics(`❌ Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-brown-800 mb-4">
        Pool Diagnostics
      </h3>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="btn-secondary mb-4"
      >
        {loading ? "Running..." : "Run Diagnostics"}
      </button>

      {diagnostics && (
        <pre className="bg-cream-50 p-4 rounded-lg text-xs overflow-auto max-h-96 text-brown-800">
          {diagnostics}
        </pre>
      )}
    </div>
  );
}
