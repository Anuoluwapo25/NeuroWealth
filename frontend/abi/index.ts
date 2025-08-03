import { MIND_ABI } from './mind';
import { MIND_STAKING_ABI } from './mind-staking';
import { YIELD_MIND_VAULT_ABI } from './yield-mind-vault';
import { AI_STRATEGY_MANAGER_ABI } from './ai-strategy-manager';
import { FEE_MANAGER_ABI } from './fee-manager';

export const MindContract = {
  abi: MIND_ABI,
  address: '0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4',
};

export const MindStakingContract = {
  abi: MIND_STAKING_ABI,
  address: '0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4',
};

export const YieldMindVaultContract = {
  abi: YIELD_MIND_VAULT_ABI,
  address: '0xD2D2cE855a37FB1FbbF131D869f3c17847B952F9',
};

export const AiStrategyManagerContract = {
  abi: AI_STRATEGY_MANAGER_ABI,
  address: '0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5',
};

export const FeeManagerContract = {
  abi: FEE_MANAGER_ABI,
  address: '0x0000000000000000000000000000000000000000', // Not deployed yet
};
