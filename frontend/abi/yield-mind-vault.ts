export const YIELD_MIND_VAULT_ABI = [
  // View Functions
  {
    "inputs": [{"type": "address"}],
    "name": "userPositions",
    "outputs": [
      {"type": "uint256", "name": "principal"},
      {"type": "uint256", "name": "currentValue"},
      {"type": "uint256", "name": "lastUpdateTime"},
      {"type": "address", "name": "depositToken"},
      {"type": "uint256", "name": "totalReturns"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "supportedTokens",
    "outputs": [
      {"type": "bool", "name": "isSupported"},
      {"type": "uint256", "name": "minDeposit"},
      {"type": "uint256", "name": "maxDeposit"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint8"}],
    "name": "tierLimits",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint8"}],
    "name": "rebalanceFrequency",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalValueLocked",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalFeesCollected",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "getUserPosition",
    "outputs": [
      {"type": "uint256", "name": "principal"},
      {"type": "uint256", "name": "currentValue"},
      {"type": "uint256", "name": "totalReturns"},
      {"type": "address", "name": "depositToken"},
      {"type": "uint8", "name": "userTier"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // State-Changing Functions
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"}
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rebalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"}
    ],
    "name": "updatePositionValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"},
      {"type": "uint256"}
    ],
    "name": "addSupportedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "StrategyExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "PerformanceFeeCollected",
    "type": "event"
  }
] as const; 