import { ethers } from 'ethers';

export const CONTRACTS = {
  YieldOracleVault: '0x1234567890123456789012345678901234567890',
  AIStrategyManager: '0x2345678901234567890123456789012345678901',
  XFIStaking: '0x3456789012345678901234567890123456789012',
};

export const YIELD_ORACLE_VAULT_ABI = [
  'function deposit(uint256 amount, uint256 riskLevel) external',
  'function withdraw(uint256 amount) external',
  'function balanceOf(address user) external view returns (uint256)',
  'function getProjectedAPY(uint256 riskLevel) external view returns (uint256)',
];

export const AI_STRATEGY_MANAGER_ABI = [
  'function getCurrentAllocations(address user) external view returns (tuple(string chain, string protocol, uint256 amount, uint256 apy)[])',
  'function getRebalanceHistory(address user) external view returns (tuple(uint256 timestamp, string action, uint256 amount)[])',
];

export const XFI_STAKING_ABI = [
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function stakedBalance(address user) external view returns (uint256)',
  'function getTierLevel(address user) external view returns (uint256)',
];

export const getContract = (address: string, abi: any[], provider: any) => {
  return new ethers.Contract(address, abi, provider);
};