export const MIND_STAKING_ABI = [
  // View Functions
  {
    "inputs": [{"type": "address"}],
    "name": "userStakes",
    "outputs": [
      {"type": "uint256", "name": "amount"},
      {"type": "uint256", "name": "stakingTime"},
      {"type": "uint256", "name": "lastClaimTime"},
      {"type": "uint256", "name": "accumulatedRewards"},
      {"type": "uint8", "name": "tier"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "calculatePendingRewards",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "getUserTier",
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "getUserStakeInfo",
    "outputs": [
      {"type": "uint256", "name": "amount"},
      {"type": "uint256", "name": "stakingTime"},
      {"type": "uint8", "name": "tier"},
      {"type": "uint256", "name": "pendingRewards"},
      {"type": "bool", "name": "canUnstake"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRewardsDistributed",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "unstakeRequestTime",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // State-Changing Functions
  {
    "inputs": [{"type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestUnstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "distributeRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"},
      {"indexed": false, "type": "uint8"}
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"},
      {"indexed": false, "type": "uint8"}
    ],
    "name": "Unstaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "RewardsClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "type": "uint256"}
    ],
    "name": "RewardsDistributed",
    "type": "event"
  }
] as const; 