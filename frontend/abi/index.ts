import { MIND_ABI } from './mind';
import { MIND_STAKING_ABI } from './mind-staking';
import { MOCK_MIND_STAKING_ABI } from './mock-mind-staking';
import { NEURO_WEALTH_VAULT_ABI } from './neuro-wealth-vault';
import { SIMPLIFIED_VAULT_ABI } from './simplified-vault';
import { AI_STRATEGY_MANAGER_ABI } from './ai-strategy-manager';
import { FEE_MANAGER_ABI } from './fee-manager';

export const MindContract = {
  abi: MIND_ABI,
  address: '0xcd418b1Cfd4112a04C83943E7584E1E15F8B9B66', // Testnet - New Deployment
};

export const MindStakingContract = {
  abi: MOCK_MIND_STAKING_ABI,
  address: '0x1191D8CA1ED414F742574E4a28D0Ab9822D3d818', // Testnet - Working MockMindStaking
};

export const NeuroWealthVaultContract = {
  abi: SIMPLIFIED_VAULT_ABI,
  address: '0x5E19885955D4062369479998753C29874f1E66c6', // Testnet - Working Simplified Vault
};

export const AiStrategyManagerContract = {
  abi: AI_STRATEGY_MANAGER_ABI,
  address: '0x4B823920717272C0Ed7e248Ac5AEff7927D8FE7C', // Testnet - Original Deployment
};

export const AiStrategyManagerV2Contract = {
  abi: AI_STRATEGY_MANAGER_ABI, // Using same ABI for now
  address: '0xE75CA0E9C69DE3a0979DD6A3dac384b398580c92', // Testnet - Fixed Vault Integration
};

export const MockProtocolContract = {
  abi: [], // Will be added after deployment
  address: '0x6F1c57D52A55BDE37C556bcb003255448D36917f', // Testnet - Fixed Mock Protocol Deployment
};

export const MockMindStakingContract = {
  abi: [], // Will be added after deployment
  address: '0xA529547b901F9613b2e0E1F171B7864d8172e674', // Testnet - Fixed Mock Protocol Deployment
};

export const FeeManagerContract = {
  abi: FEE_MANAGER_ABI,
  address: '0x0000000000000000000000000000000000000000', // Not deployed yet
};
