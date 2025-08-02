// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MIND is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18; // 100M MIND
    
    // Distribution allocations
    uint256 public constant TEAM_ALLOCATION = 15_000_000 * 1e18;     // 15%
    uint256 public constant TREASURY_ALLOCATION = 20_000_000 * 1e18; // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = 10_000_000 * 1e18; // 10%
    uint256 public constant STAKING_REWARDS = 25_000_000 * 1e18;     // 25%
    uint256 public constant PUBLIC_SALE = 20_000_000 * 1e18;         // 20%
    uint256 public constant ECOSYSTEM_FUND = 10_000_000 * 1e18;      // 10%
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("YieldMind", "MIND") {
        // Initial mint to deployer for distribution
        _mint(msg.sender, TEAM_ALLOCATION + TREASURY_ALLOCATION + LIQUIDITY_ALLOCATION);
    }
    
    /**
     * @dev Mint tokens - only for authorized contracts
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Add authorized minter (staking contract, etc.)
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized minter");
        _;
    }
}