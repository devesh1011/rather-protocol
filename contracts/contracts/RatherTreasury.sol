// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RatherToken.sol";
import "./RatherMarketplace.sol";
import "./RatherLiquidityPool.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RatherTreasury
 * @dev Automated treasury that executes the perpetual flywheel:
 * 1. Accumulates ETH from LP fees
 * 2. When balance ≥ floor price, buys cheapest NFT
 * 3. Relists NFT at 10% premium
 * 4. When relisted NFT sells, uses proceeds to buy & burn RATHER
 */
contract RatherTreasury is ReentrancyGuard, Ownable {
    RatherToken public immutable ratherToken;
    RatherMarketplace public marketplace;
    RatherLiquidityPool public liquidityPool;
    address public immutable nftContract;

    uint256 public constant RELIST_PREMIUM_PERCENT = 10;
    uint256 public constant FEE_DENOMINATOR = 100;

    // Balance available for RATHER burns (from NFT sales)
    uint256 public burnableBalance;

    // Cooldown to prevent spam
    uint256 public lastSweepTime;
    uint256 public constant SWEEP_COOLDOWN = 1 hours;

    // Minimum treasury balance to attempt sweep
    uint256 public minSweepThreshold = 0.01 ether;

    event FloorSwept(uint256 indexed tokenId, uint256 price);
    event NFTRelisted(uint256 indexed tokenId, uint256 newPrice);
    event RatherBurned(uint256 amountEth, uint256 amountRather);
    event SaleProceeds(uint256 amount);

    constructor(
        address _ratherToken,
        address _nftContract
    ) Ownable(msg.sender) {
        ratherToken = RatherToken(_ratherToken);
        nftContract = _nftContract;
    }

    function setMarketplace(address _marketplace) external onlyOwner {
        marketplace = RatherMarketplace(_marketplace);
    }

    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        liquidityPool = RatherLiquidityPool(payable(_liquidityPool));
    }

    function setMinSweepThreshold(uint256 _threshold) external onlyOwner {
        minSweepThreshold = _threshold;
    }

    /**
     * @dev Check if conditions met and execute floor sweep + relist
     * Called automatically after LP swaps or manually
     */
    function checkAndSweep() external nonReentrant {
        require(address(marketplace) != address(0), "Marketplace not set");

        // Check cooldown
        if (block.timestamp < lastSweepTime + SWEEP_COOLDOWN) {
            return;
        }

        // Check if we have enough ETH
        uint256 availableBalance = address(this).balance - burnableBalance;
        if (availableBalance < minSweepThreshold) {
            return;
        }

        // Get floor price
        try marketplace.getFloorPrice() returns (
            uint256 floorPrice,
            uint256 floorTokenId
        ) {
            if (floorPrice == 0 || availableBalance < floorPrice) {
                return;
            }

            // Execute sweep
            _executeSweep(floorTokenId, floorPrice);
            lastSweepTime = block.timestamp;
        } catch {
            // No listings available or error
            return;
        }
    }

    /**
     * @dev Internal function to buy floor NFT and relist
     */
    function _executeSweep(uint256 tokenId, uint256 floorPrice) private {
        // Buy NFT from marketplace
        marketplace.buyNFT{value: floorPrice}(tokenId);

        emit FloorSwept(tokenId, floorPrice);

        // Calculate relist price (10% premium)
        uint256 relistPrice = floorPrice +
            ((floorPrice * RELIST_PREMIUM_PERCENT) / FEE_DENOMINATOR);

        // Approve marketplace and relist
        IERC721(nftContract).approve(address(marketplace), tokenId);
        marketplace.treasuryRelist(tokenId, relistPrice);

        emit NFTRelisted(tokenId, relistPrice);
    }

    /**
     * @dev Called by marketplace when treasury-owned NFT is sold
     * @param amount Sale proceeds in ETH
     */
    function notifySale(uint256 amount) external {
        require(msg.sender == address(marketplace), "Only marketplace");

        burnableBalance += amount;
        emit SaleProceeds(amount);

        // Attempt burn immediately
        _buyAndBurn();
    }

    /**
     * @dev Use burnable balance to buy RATHER from LP and burn it
     */
    function _buyAndBurn() private {
        if (burnableBalance == 0 || address(liquidityPool) == address(0)) {
            return;
        }

        uint256 amountToBurn = burnableBalance;
        burnableBalance = 0;

        // Get expected RATHER output
        uint256 ratherExpected = liquidityPool.getRatherOut(amountToBurn);
        if (ratherExpected == 0) {
            // No liquidity, restore balance
            burnableBalance = amountToBurn;
            return;
        }

        // Swap ETH for RATHER
        uint256 ratherBefore = ratherToken.balanceOf(address(this));
        liquidityPool.swapEthForRather{value: amountToBurn}();
        uint256 ratherReceived = ratherToken.balanceOf(address(this)) -
            ratherBefore;

        // Burn RATHER
        if (ratherReceived > 0) {
            ratherToken.burnFromTreasury(ratherReceived);
            emit RatherBurned(amountToBurn, ratherReceived);
        }
    }

    /**
     * @dev Manual trigger for buy & burn (in case auto fails)
     */
    function manualBuyAndBurn() external onlyOwner {
        _buyAndBurn();
    }

    /**
     * @dev Emergency withdrawal (owner only, for safety)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Get treasury stats
     */
    function getTreasuryStats()
        external
        view
        returns (
            uint256 totalBalance,
            uint256 operationalBalance,
            uint256 burnBalance,
            uint256 ratherBalance
        )
    {
        totalBalance = address(this).balance;
        burnBalance = burnableBalance;
        operationalBalance = totalBalance - burnBalance;
        ratherBalance = ratherToken.balanceOf(address(this));
    }

    receive() external payable {
        // Accept ETH from LP fees
    }
}
