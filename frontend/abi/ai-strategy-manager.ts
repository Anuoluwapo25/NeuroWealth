export const AI_STRATEGY_MANAGER_ABI = [
  // View Functions
  {
    "inputs": [{"type": "address"}],
    "name": "protocols",
    "outputs": [
      {"type": "address", "name": "protocolAddress"},
      {"type": "string", "name": "name"},
      {"type": "uint256", "name": "currentAPY"},
      {"type": "uint256", "name": "riskScore"},
      {"type": "uint256", "name": "tvl"},
      {"type": "bool", "name": "isActive"},
      {"type": "uint256", "name": "allocation"},
      {"type": "uint256", "name": "lastUpdate"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "protocolList",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "getUserStrategy",
    "outputs": [
      {"type": "uint256", "name": "totalValue"},
      {"type": "uint256", "name": "lastRebalance"},
      {"type": "address", "name": "depositToken"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dataOracle",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // State-Changing Functions
  {
    "inputs": [
      {"type": "uint256"},
      {"type": "address"}
    ],
    "name": "executeStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "rebalancePortfolio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "string"},
      {"type": "uint256"},
      {"type": "uint256"},
      {"type": "uint256"}
    ],
    "name": "addProtocol",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"},
      {"type": "uint256"},
      {"type": "uint256"}
    ],
    "name": "updateProtocolData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "setDataOracle",
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
    "name": "StrategyExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "PortfolioRebalanced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "string"}
    ],
    "name": "ProtocolAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address"},
      {"indexed": false, "type": "uint256"}
    ],
    "name": "AllocationUpdated",
    "type": "event"
  }
] as const; 