import { MIND_ABI } from './mind';
import { MIND_STAKING_ABI } from './mind-staking';
import { YIELD_MIND_VAULT_ABI } from './yield-mind-vault';
import { AI_STRATEGY_MANAGER_ABI } from './ai-strategy-manager';
import { FEE_MANAGER_ABI } from './fee-manager';

export const MindContract = {
  abi: MIND_ABI,
  address: '0x953386dF478cFb0E0daE7ADa16d22B61114b5148', // Somnia Testnet
};

export const MindStakingContract = {
  abi: MIND_STAKING_ABI,
  address: '0x977fB30EE25E8A07855d512E1A877F2Bae377bf6', // Somnia Testnet
};

export const YieldMindVaultContract = {
  abi: YIELD_MIND_VAULT_ABI,
  address: '0xE1173422100262BA7B1D2141ACC629f8a8F07370', // Somnia Testnet
};

export const AiStrategyManagerContract = {
  abi: AI_STRATEGY_MANAGER_ABI,
  address: '0x902CF9fC71d391320B9736A7e88B063AEf6608aC', // Somnia Testnet
};

export const FeeManagerContract = {
  abi: FEE_MANAGER_ABI,
  address: '0x0000000000000000000000000000000000000000', // Not deployed yet
};
