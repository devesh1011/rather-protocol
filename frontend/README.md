# Rather Protocol Frontend

Minimalist cream-themed dApp interface for the Rather Strategy Protocol on Arbitrum Sepolia.

## 🎨 Design System

- **Color Palette**: Cream backgrounds (#FFF5E6, #FFE4C4, #F5DEB3) with brown accents (#8B4513, #6B3410)
- **Typography**: Inter font family
- **Components**: Rounded corners (1-1.5rem border-radius) throughout
- **Style**: Minimalist, clean, professional

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

Create a `.env.local` file with your WalletConnect project ID:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Get your Project ID:**

1. Go to https://cloud.reown.com
2. Create a free account
3. Create a new project
4. Copy the Project ID
5. Paste it in `.env.local`

### 3. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4
- **Web3 Stack**:
  - wagmi 3.3.2 (React Hooks for Ethereum)
  - viem 2.44.2 (TypeScript Ethereum library)
  - @reown/appkit 1.8.16 (WalletConnect v3)
  - @tanstack/react-query 5.90.17

## 📄 Pages

### 🏠 Home (`/`)

- Hero section with protocol description
- Live Treasury Dashboard (real-time stats)
- Flywheel visualization
- Quick action cards to Mint, Marketplace, Swap

### 🎨 Mint NFT (`/mint`)

- Mint Rather NFTs for free (only gas fees)
- Input metadata URI (IPFS or HTTP)
- Transaction status tracking
- Success confirmation with token ID

### 🏪 Marketplace (`/marketplace`)

- View all active NFT listings
- Buy NFTs with ETH
- List your own NFTs (approve + list flow)
- Cancel your listings
- Real-time listing updates

### 💱 Swap (`/swap`)

- Swap ETH for RATHER tokens
- 10% fee to treasury (fuels the flywheel)
- Live pool reserves display
- Price impact calculation
- Swap confirmation with received amount

### 👑 Admin (`/admin`)

- Owner-only access (restricted by wallet address)
- View detailed treasury stats
- Manual sweep trigger (emergency use)
- Manual buy & burn trigger (testing)
- Protocol health monitoring

## 🔗 Contract Addresses (Arbitrum Sepolia)

All contract addresses are configured in `/lib/contracts.ts`:

- **RatherToken**: `0xd4D791861574EfB476d4fFe4F99062B267C434f8`
- **RatherNFT**: `0x5c29bc86f34505f20a23CB1501E010c52e6C41Ac`
- **RatherMarketplace**: `0x9fCF4af886D2A8200B499297b7626895E2cCf3C3`
- **RatherLiquidityPool**: `0xfc19E178a9c4C6637CA030Bc57b839b30f381889`
- **RatherTreasury**: `0x0C2E07642E850A088585bC9c39c5287535eeB634`

**Network**: Arbitrum Sepolia (Chain ID: 421614)  
**RPC**: https://sepolia-rollup.arbitrum.io/rpc

## 🔄 The Flywheel

1. **Swap**: Users swap ETH ↔ RATHER with 10% fees → Treasury
2. **Auto-Sweep**: When treasury ≥ floor price, auto-buy cheapest NFT
3. **Relist**: NFT relisted at 10% premium
4. **Buy & Burn**: Sale proceeds buy RATHER from AMM and burn 🔥
5. **Repeat**: Autonomous cycle creating deflationary pressure

## 🎯 Key Features

- ✅ **Real Transactions Only**: No mock data, all blockchain interactions
- ✅ **WalletConnect v3**: Secure wallet connection with @reown/appkit
- ✅ **Real-Time Updates**: Auto-refetch every 10 seconds via React Query
- ✅ **Loading States**: Skeleton UI and transaction status tracking
- ✅ **Responsive Design**: Mobile-friendly with cream minimalist aesthetic
- ✅ **Type-Safe**: Full TypeScript with proper contract ABIs

## 🧩 Component Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # Web3 provider wrapper
│   ├── globals.css          # Global styles + design system
│   ├── mint/
│   │   └── page.tsx         # Mint NFT page
│   ├── marketplace/
│   │   └── page.tsx         # Marketplace page
│   ├── swap/
│   │   └── page.tsx         # Swap page
│   └── admin/
│       └── page.tsx         # Admin panel
├── components/
│   ├── Navigation.tsx       # Top nav bar with wallet button
│   └── TreasuryDashboard.tsx # Live protocol stats
└── lib/
    ├── contracts.ts         # Contract addresses + ABIs
    └── config.ts            # Wagmi/WalletConnect config
```

## 🛠️ Configuration Files

### `/lib/config.ts`

- WagmiAdapter for Arbitrum Sepolia
- WalletConnect/Reown AppKit setup
- Custom cream theme variables
- QueryClient with 10s refetch interval

### `/lib/contracts.ts`

- All 5 contract addresses
- Full ABIs for each contract
- Owner address for admin checks

## 🎨 Custom CSS Utilities

Defined in `globals.css`:

- `.card` - Cream background, rounded corners, padding
- `.btn-primary` - Brown solid button
- `.btn-secondary` - Brown outline button
- `.input` - Cream input field with brown border

## 🧪 Testing Locally

1. **Connect Wallet**: Use WalletConnect modal (top-right button)
2. **Get Test ETH**: https://faucet.quicknode.com/arbitrum/sepolia
3. **Mint NFT**: Create a test metadata URI
4. **List NFT**: Approve + list your minted NFT
5. **Swap**: Trade ETH for RATHER (generates 10% fee)
6. **Watch Dashboard**: See treasury stats update in real-time

## 🔐 Security Notes

- Never commit your `.env.local` file
- WalletConnect project ID is public-safe (client-side only)
- Admin functions restricted to owner address
- Always verify contract addresses before transactions

## 📚 Resources

- [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- [WalletConnect Cloud](https://cloud.reown.com)
- [wagmi Documentation](https://wagmi.sh)
- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Rather Protocol Contracts](../contracts/)

## 🐛 Troubleshooting

**Wallet won't connect:**

- Ensure you've added `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env.local`
- Try refreshing the page
- Check browser console for errors

**Transactions failing:**

- Ensure you're on Arbitrum Sepolia network
- Check you have sufficient ETH for gas
- Verify contract addresses in `/lib/contracts.ts`

**Stats not updating:**

- Queries auto-refetch every 10 seconds
- Manual refetch on successful transactions
- Check network connection to Arbitrum Sepolia RPC

## 🎯 Next Steps

1. ✅ Get WalletConnect Project ID
2. ✅ Connect wallet and get test ETH
3. ✅ Mint your first NFT
4. ✅ Test the full flywheel cycle
5. ✅ Monitor treasury dashboard

---

Built with ❤️ for Arbitrum Hackathon
