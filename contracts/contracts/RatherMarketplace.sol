// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRatherTreasury.sol";

/**
 * @title RatherMarketplace
 * @dev Decentralized NFT marketplace for RatherNFT collection
 * - Anyone can list/buy/cancel listings
 * - Treasury can programmatically buy and relist NFTs
 * - Tracks floor price for treasury automation
 */
contract RatherMarketplace is ReentrancyGuard, Ownable {
    address public treasury;
    address public nftContract;

    struct Listing {
        uint256 price;
        address seller;
        bool active;
    }

    // tokenId => Listing
    mapping(uint256 => Listing) public listings;

    // Track all active listing IDs for floor price calculation
    uint256[] private activeListings;
    mapping(uint256 => uint256) private listingIndex; // tokenId => index in activeListings

    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event NFTSold(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event TreasurySet(address indexed newTreasury);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = _nftContract;
    }

    /**
     * @dev Set treasury address (owner only)
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasurySet(_treasury);
    }

    /**
     * @dev List NFT for sale (must approve marketplace first)
     * @param tokenId ID of NFT to list
     * @param price Listing price in wei
     */
    function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // Transfer NFT to marketplace
        nft.transferFrom(msg.sender, address(this), tokenId);

        // Create listing
        listings[tokenId] = Listing({
            price: price,
            seller: msg.sender,
            active: true
        });

        // Add to active listings array
        listingIndex[tokenId] = activeListings.length;
        activeListings.push(tokenId);

        emit NFTListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Buy listed NFT
     * @param tokenId ID of NFT to purchase
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(msg.value >= listing.price, "Insufficient payment");

        // Transfer NFT to buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Transfer payment to seller
        payable(listing.seller).transfer(listing.price);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        // Remove from active listings
        _removeListing(tokenId);

        // Notify treasury if seller is treasury (relist sale)
        if (listing.seller == treasury && treasury != address(0)) {
            IRatherTreasury(treasury).notifySale(listing.price);
        }

        emit NFTSold(tokenId, msg.sender, listing.seller, listing.price);
    }

    /**
     * @dev Cancel listing (seller only)
     * @param tokenId ID of NFT to delist
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");

        // Transfer NFT back to seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Remove listing
        _removeListing(tokenId);

        emit ListingCancelled(tokenId, msg.sender);
    }

    /**
     * @dev Get floor price (cheapest listing)
     */
    function getFloorPrice()
        public
        view
        returns (uint256 floorPrice, uint256 floorTokenId)
    {
        require(activeListings.length > 0, "No active listings");

        floorPrice = type(uint256).max;
        floorTokenId = 0;

        for (uint256 i = 0; i < activeListings.length; i++) {
            uint256 tokenId = activeListings[i];
            Listing memory listing = listings[tokenId];

            if (listing.active && listing.price < floorPrice) {
                floorPrice = listing.price;
                floorTokenId = tokenId;
            }
        }

        require(floorPrice != type(uint256).max, "No valid listings");
    }

    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }

    /**
     * @dev Treasury-specific function to relist NFT it owns
     * @param tokenId ID of NFT to relist
     * @param price New listing price
     */
    function treasuryRelist(uint256 tokenId, uint256 price) external {
        require(msg.sender == treasury, "Only treasury");
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == treasury, "Treasury doesn't own token");

        // Treasury must have approved marketplace
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(treasury, address(this)),
            "Marketplace not approved"
        );

        // Transfer to marketplace
        nft.transferFrom(treasury, address(this), tokenId);

        // Create listing
        listings[tokenId] = Listing({
            price: price,
            seller: treasury,
            active: true
        });

        listingIndex[tokenId] = activeListings.length;
        activeListings.push(tokenId);

        emit NFTListed(tokenId, treasury, price);
    }

    /**
     * @dev Internal function to remove listing
     */
    function _removeListing(uint256 tokenId) private {
        listings[tokenId].active = false;

        // Remove from activeListings array (swap with last and pop)
        uint256 index = listingIndex[tokenId];
        uint256 lastIndex = activeListings.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = activeListings[lastIndex];
            activeListings[index] = lastTokenId;
            listingIndex[lastTokenId] = index;
        }

        activeListings.pop();
        delete listingIndex[tokenId];
    }
}
