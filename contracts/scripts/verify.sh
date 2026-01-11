#!/bin/bash

# Verify all Rather Protocol contracts on Arbitrum Sepolia

echo "🔍 Verifying Rather Protocol Contracts on Arbiscan..."
echo ""

# Contract addresses
TOKEN="0xd4D791861574EfB476d4fFe4F99062B267C434f8"
NFT="0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac"
MARKETPLACE="0x9fCF4af886D2A8200B499297b7626895E2cCf3C3"
POOL="0xfc19E178a9c4C6637CA030Bc57b839b30f381889"
TREASURY="0x0C2E07642E850A088585bC9c39c5287535eeB634"

echo "1️⃣ Verifying RatherToken..."
npx hardhat verify --network arbitrumSepolia $TOKEN "Rather" "RATHER" "1000000000000000000000000"
echo ""

echo "2️⃣ Verifying RatherNFT..."
npx hardhat verify --network arbitrumSepolia $NFT "RatherNFT" "RNFT" "" 0
echo ""

echo "3️⃣ Verifying RatherMarketplace..."
npx hardhat verify --network arbitrumSepolia $MARKETPLACE $NFT
echo ""

echo "4️⃣ Verifying RatherLiquidityPool..."
npx hardhat verify --network arbitrumSepolia $POOL $TOKEN
echo ""

echo "5️⃣ Verifying RatherTreasury..."
npx hardhat verify --network arbitrumSepolia $TREASURY $TOKEN $NFT
echo ""

echo "✅ All contracts verified!"
echo ""
echo "View on Arbiscan:"
echo "  Token: https://sepolia.arbiscan.io/address/$TOKEN"
echo "  NFT: https://sepolia.arbiscan.io/address/$NFT"
echo "  Marketplace: https://sepolia.arbiscan.io/address/$MARKETPLACE"
echo "  Pool: https://sepolia.arbiscan.io/address/$POOL"
echo "  Treasury: https://sepolia.arbiscan.io/address/$TREASURY"
