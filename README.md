# Rather Strategy Protocol

> **Autonomous NFT Treasury Flywheel on Arbitrum Sepolia**

A self-sustaining on-chain economic loop: collects 10% swap fees → auto-buys floor NFTs → relists at 10% premium → burns RATHER tokens with profits → repeats perpetually.

**Zero manual intervention. 100% on-chain. Fully transparent.**

[![Watch the Rather Strategy Protocol Demo](https://img.youtube.com/vi/FV6zNLXVhCE/maxresdefault.jpg)](https://youtu.be/FV6zNLXVhCE)

**[Watch Full Demo on YouTube](https://youtu.be/FV6zNLXVhCE)**

## 🚀 Live Deployment (Arbitrum Sepolia)

| Contract                | Address                                      | Arbiscan                                                                               |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| **RatherToken**         | `0xd4D791861574EfB476d4fFe4F99062B267C434f8` | [View](https://sepolia.arbiscan.io/address/0xd4D791861574EfB476d4fFe4F99062B267C434f8) |
| **RatherNFT**           | `0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac` | [View](https://sepolia.arbiscan.io/address/0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac) |
| **RatherMarketplace**   | `0x9fCF4af886D2A8200B499297b7626895E2cCf3C3` | [View](https://sepolia.arbiscan.io/address/0x9fCF4af886D2A8200B499297b7626895E2cCf3C3) |
| **RatherLiquidityPool** | `0xfc19E178a9c4C6637CA030Bc57b839b30f381889` | [View](https://sepolia.arbiscan.io/address/0xfc19E178a9c4C6637CA030Bc57b839b30f381889) |
| **RatherTreasury**      | `0x0C2E07642E850A088585bC9c39c5287535eeB634` | [View](https://sepolia.arbiscan.io/address/0x0C2E07642E850A088585bC9c39c5287535eeB634) |

**Network:** Arbitrum Sepolia (Chain ID: 421614)  
**RPC:** https://sepolia-rollup.arbitrum.io/rpc

## ✨ Key Features

### 🤖 Fully Autonomous

- No admin intervention required after setup
- Self-executing smart contracts
- Cooldown periods prevent manipulation

### 💰 Deflationary Economics

- 10% swap fees fund treasury operations
- Continuous token burns reduce supply
- Premium relisting creates treasury profits

### 🔒 Battle-Tested Security

- OpenZeppelin contracts (ERC-20, ERC-721)
- ReentrancyGuard protection
- Ownable access controls
- No upgradeable proxies (immutable logic)

### ⚡ Arbitrum L2 Advantages

- ~95% cheaper gas vs Ethereum L1
- Fast transaction finality
- Seamless MetaMask integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTIONS                        │
│  Mint NFTs → List on Marketplace → Swap ETH ↔ RATHER       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ 10% fees
            ┌─────────────────┐
            │  TREASURY       │
            │  (Autonomous)   │
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
   Balance ≥   Buy Floor   Relist at
   Floor?      NFT          +10%
        │            │            │
        └────────────┴────────────┘
                     │
              Sale Proceeds
                     ↓
            ┌─────────────────┐
            │  BUY & BURN     │
            │  RATHER Tokens  │
            └─────────────────┘
                     │
                     ↓
              ♻️  REPEAT
```

## 🛠️ Technology Stack

- **Blockchain:** Arbitrum (L2 Rollup)
- **Smart Contracts:** Solidity 0.8.20
- **Development:** Hardhat 3.1.4
- **Standards:** ERC-20, ERC-721, ERC-721Enumerable
- **Security:** OpenZeppelin Contracts 5.x
- **Testing:** TypeScript, ethers.js v6

## � Quick Start

### Prerequisites

- Node.js 18+
- Bun (package manager)
- MetaMask (for testing frontend)

### Setup

```bash
# Install smart contract dependencies
cd contracts
bun install

# Install frontend dependencies
cd ../frontend
bun install
```

### Run Frontend

```bash
cd frontend
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and connect MetaMask to **Arbitrum Sepolia**.

### Deploy Contracts (if needed)

```bash
cd contracts
# Add PRIVATE_KEY to .env.local
bun hardhat compile
bun hardhat ignition deploy ignition/modules/RatherProtocol.ts --network arbitrumSepolia
```

## � Features

✅ **Mint:** Free NFT minting (gas only)  
✅ **Swap:** ETH ↔ RATHER with 10% treasury fee  
✅ **Marketplace:** List, buy, sell NFTs  
✅ **Treasury:** Auto-buys floor NFTs, relists at +10%, burns tokens  
✅ **Admin:** Liquidity management, treasury sweep controls  
✅ **Dashboard:** Live treasury stats, burned tokens, pool reserves  
✅ **Mobile:** Fully responsive design with hamburger navigation

## 🛠️ Tech Stack

Next.js 16.1.2, React 19.2.3, TypeScript, Tailwind CSS v4, ethers.js v6.16.0, Solidity 0.8.28, Hardhat, Arbitrum Sepolia, Turbopack, Bun
