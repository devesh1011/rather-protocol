// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRatherTreasury.sol";

/**
 * @title RatherLiquidityPool
 * @dev Simple constant-product AMM for ETH <-> RATHER swaps
 * - 10% fee on all swaps goes to treasury
 * - Automatically triggers treasury sweep check after swaps
 */
contract RatherLiquidityPool is ReentrancyGuard, Ownable {
    IERC20 public immutable ratherToken;
    address public treasury;

    uint256 public ethReserve;
    uint256 public ratherReserve;

    uint256 public constant SWAP_FEE_PERCENT = 10;
    uint256 public constant FEE_DENOMINATOR = 100;

    event LiquidityAdded(
        address indexed provider,
        uint256 ethAmount,
        uint256 ratherAmount
    );
    event Swapped(
        address indexed user,
        bool ethToRather,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    constructor(address _ratherToken) Ownable(msg.sender) {
        ratherToken = IERC20(_ratherToken);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @dev Add initial liquidity (owner only for bootstrap)
     */
    function addLiquidity(uint256 ratherAmount) external payable onlyOwner {
        require(msg.value > 0 && ratherAmount > 0, "Invalid amounts");

        ratherToken.transferFrom(msg.sender, address(this), ratherAmount);

        ethReserve += msg.value;
        ratherReserve += ratherAmount;

        emit LiquidityAdded(msg.sender, msg.value, ratherAmount);
    }

    /**
     * @dev Swap ETH for RATHER
     */
    function swapEthForRather() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        require(ratherReserve > 0, "No liquidity");

        // Calculate fee
        uint256 fee = (msg.value * SWAP_FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 amountAfterFee = msg.value - fee;

        // Calculate output using constant product (x * y = k)
        uint256 ratherOut = getRatherOut(amountAfterFee);
        require(
            ratherOut > 0 && ratherOut <= ratherReserve,
            "Insufficient liquidity"
        );

        // Update reserves
        ethReserve += amountAfterFee;
        ratherReserve -= ratherOut;

        // Transfer RATHER to user
        ratherToken.transfer(msg.sender, ratherOut);

        // Send fee to treasury
        if (treasury != address(0) && fee > 0) {
            payable(treasury).transfer(fee);

            // Trigger treasury sweep check
            try IRatherTreasury(treasury).checkAndSweep() {} catch {}
        }

        emit Swapped(msg.sender, true, msg.value, ratherOut, fee);
    }

    /**
     * @dev Swap RATHER for ETH
     */
    function swapRatherForEth(uint256 ratherAmount) external nonReentrant {
        require(ratherAmount > 0, "No RATHER sent");
        require(ethReserve > 0, "No liquidity");

        // Transfer RATHER from user
        ratherToken.transferFrom(msg.sender, address(this), ratherAmount);

        // Calculate fee
        uint256 fee = (ratherAmount * SWAP_FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 amountAfterFee = ratherAmount - fee;

        // Calculate output
        uint256 ethOut = getEthOut(amountAfterFee);
        require(ethOut > 0 && ethOut <= ethReserve, "Insufficient liquidity");

        // Update reserves
        ratherReserve += amountAfterFee;
        ethReserve -= ethOut;

        // Transfer ETH to user
        payable(msg.sender).transfer(ethOut);

        // Transfer fee RATHER to treasury (treasury can later burn)
        if (treasury != address(0) && fee > 0) {
            ratherToken.transfer(treasury, fee);

            try IRatherTreasury(treasury).checkAndSweep() {} catch {}
        }

        emit Swapped(msg.sender, false, ratherAmount, ethOut, fee);
    }

    /**
     * @dev Get RATHER output for ETH input (after fee)
     */
    function getRatherOut(uint256 ethIn) public view returns (uint256) {
        if (ethReserve == 0 || ratherReserve == 0) return 0;
        uint256 k = ethReserve * ratherReserve;
        uint256 newEthReserve = ethReserve + ethIn;
        uint256 newRatherReserve = k / newEthReserve;
        return ratherReserve - newRatherReserve;
    }

    /**
     * @dev Get ETH output for RATHER input (after fee)
     */
    function getEthOut(uint256 ratherIn) public view returns (uint256) {
        if (ethReserve == 0 || ratherReserve == 0) return 0;
        uint256 k = ethReserve * ratherReserve;
        uint256 newRatherReserve = ratherReserve + ratherIn;
        uint256 newEthReserve = k / newRatherReserve;
        return ethReserve - newEthReserve;
    }

    receive() external payable {}
}
