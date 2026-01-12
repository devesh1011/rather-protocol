"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import { ARBITRUM_SEPOLIA } from "@/lib/ethers-config";
import { useState, useEffect } from "react";

export function Navigation() {
  const pathname = usePathname();
  const { isConnected, address, connect, disconnect, chainId } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/mint", label: "Mint NFT" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/swap", label: "Swap" },
    { href: "/admin", label: "Admin" },
  ];

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-brown-800">
              Rather Protocol
            </Link>
            <div className="hidden md:flex space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-brown-600 text-white"
                      : "text-brown-700 hover:bg-cream-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <>
                {isConnected ? (
                  <div className="hidden sm:flex items-center space-x-3">
                    <span className="text-sm text-brown-700 font-medium">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    {chainId !== ARBITRUM_SEPOLIA.chainId && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Wrong Network
                      </span>
                    )}
                    <button
                      onClick={disconnect}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="hidden sm:block px-4 py-2 rounded-lg bg-brown-600 text-white text-sm font-medium hover:bg-brown-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-brown-700 hover:bg-cream-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cream-200 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-brown-600 text-white"
                    : "text-brown-700 hover:bg-cream-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Wallet Section */}
            <div className="border-t border-cream-200 pt-4 mt-4">
              {isConnected ? (
                <>
                  <div className="px-4 py-2 text-sm text-brown-700 font-medium">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  {chainId !== ARBITRUM_SEPOLIA.chainId && (
                    <div className="px-4 py-2 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Wrong Network
                    </div>
                  )}
                  <button
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleConnect();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-brown-600 text-white text-sm font-medium hover:bg-brown-700 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
