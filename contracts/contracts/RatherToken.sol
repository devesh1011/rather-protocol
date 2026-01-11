// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RatherToken
 * @dev Deflationary ERC20 token for Rather Strategy Protocol
 * - Fixed initial supply
 * - Burnable to reduce circulating supply
 * - Treasury can burn tokens to create deflationary pressure
 */
contract RatherToken is ERC20, ERC20Burnable, Ownable {
    // Treasury address authorized to burn tokens
    address public treasury;

    // Total burned tokens (for tracking)
    uint256 public totalBurned;

    event TreasurySet(address indexed newTreasury);
    event TokensBurned(address indexed burner, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Set treasury address (owner only, one-time or updateable)
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasurySet(_treasury);
    }

    /**
     * @dev Burn tokens from treasury's balance (treasury only)
     * @param amount Amount of tokens to burn
     */
    function burnFromTreasury(uint256 amount) external {
        require(msg.sender == treasury, "Only treasury can burn");
        require(balanceOf(treasury) >= amount, "Insufficient treasury balance");

        _burn(treasury, amount);
        totalBurned += amount;

        emit TokensBurned(treasury, amount);
    }

    /**
     * @dev Override burn to track total burned
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Get circulating supply (total - burned)
     */
    function circulatingSupply() public view returns (uint256) {
        return totalSupply();
    }
}
