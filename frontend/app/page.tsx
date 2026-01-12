import { TreasuryDashboard } from "@/components/TreasuryDashboard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-brown-800 mb-4">
          Rather Strategy Protocol
        </h1>
        <p className="text-xl text-brown-600 max-w-3xl mx-auto">
          Autonomous Perpetual NFT Treasury Flywheel on Arbitrum
        </p>
        <p className="text-brown-700 mt-4 max-w-2xl mx-auto">
          A self-sustaining on-chain economic loop combining NFT trading, DeFi
          liquidity pools, and automated treasury management with deflationary
          token burns.
        </p>
      </div>

      {/* Treasury Dashboard */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-brown-800 mb-6">
          Live Protocol Stats
        </h2>
        <TreasuryDashboard />
      </div>

      {/* Flywheel Visualization */}
      <div className="card mb-16">
        <h2 className="text-2xl font-bold text-brown-800 mb-6">
          How the Flywheel Works
        </h2>
        <div className="grid md:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brown-600 text-white flex items-center justify-center text-2xl mb-3">
              1
            </div>
            <h3 className="font-semibold text-brown-800 mb-2">Swap</h3>
            <p className="text-sm text-brown-600">
              Users swap ETH ↔ RATHER with 10% fees
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-4xl text-brown-600">→</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brown-600 text-white flex items-center justify-center text-2xl mb-3">
              2
            </div>
            <h3 className="font-semibold text-brown-800 mb-2">
              Treasury Sweep
            </h3>
            <p className="text-sm text-brown-600">
              Auto-buys floor NFT when balance ≥ floor
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-4xl text-brown-600">→</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brown-600 text-white flex items-center justify-center text-2xl mb-3">
              3
            </div>
            <h3 className="font-semibold text-brown-800 mb-2">Buy & Burn 🔥</h3>
            <p className="text-sm text-brown-600">
              Sale proceeds buy and burn RATHER tokens
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/mint" className="card hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-brown-800 mb-2">🎨 Mint NFT</h3>
          <p className="text-brown-600 mb-4">
            Create and mint your own NFTs for free
          </p>
          <div className="btn-primary inline-block">Start Minting →</div>
        </Link>

        <Link
          href="/marketplace"
          className="card hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-bold text-brown-800 mb-2">
            🏪 Marketplace
          </h3>
          <p className="text-brown-600 mb-4">
            Buy, sell, and trade NFTs on our marketplace
          </p>
          <div className="btn-primary inline-block">Browse →</div>
        </Link>

        <Link href="/swap" className="card hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-brown-800 mb-2">💱 Swap</h3>
          <p className="text-brown-600 mb-4">
            Trade ETH for RATHER tokens (10% fee to treasury)
          </p>
          <div className="btn-primary inline-block">Swap Now →</div>
        </Link>
      </div>
    </div>
  );
}
