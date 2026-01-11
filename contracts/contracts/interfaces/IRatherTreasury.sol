// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRatherTreasury
 * @dev Interface for RatherTreasury contract
 */
interface IRatherTreasury {
    /**
     * @dev Check if conditions are met and execute floor sweep + relist
     * Called automatically after LP swaps or manually
     */
    function checkAndSweep() external;

    /**
     * @dev Called by marketplace when treasury-owned NFT is sold
     * @param amount Sale proceeds in ETH
     */
    function notifySale(uint256 amount) external;
}
