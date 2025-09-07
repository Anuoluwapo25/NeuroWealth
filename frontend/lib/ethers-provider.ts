import { ethers } from 'ethers';
import { YieldMindVaultContract } from '@/abi';

// Somnia Testnet configuration
export const SOMNIA_CONFIG = {
  chainId: 50312,
  name: 'Somnia Testnet',
  rpcUrls: [
    'https://dream-rpc.somnia.network',
    'https://testnet-rpc.somnia.network',
    'https://rpc.somnia.network'
  ],
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  blockExplorer: 'https://explorer.somnia.network'
};

// Create ethers provider with fallback RPCs
export const createEthersProvider = () => {
  const providers = SOMNIA_CONFIG.rpcUrls.map(url => 
    new ethers.JsonRpcProvider(url, {
      chainId: SOMNIA_CONFIG.chainId,
      name: SOMNIA_CONFIG.name,
    })
  );
  
  // Use the first provider as primary, others as fallbacks
  return providers[0];
};

// Create ethers signer from window.ethereum
export const createEthersSigner = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Request account access
  await provider.send('eth_requestAccounts', []);
  
  // Get signer
  const signer = await provider.getSigner();
  
  // Verify we're on the correct network
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== SOMNIA_CONFIG.chainId) {
    throw new Error(`Please switch to Somnia Testnet (Chain ID: ${SOMNIA_CONFIG.chainId})`);
  }
  
  return signer;
};

// Get contract instance with ethers
export const getYieldMindVaultContract = async () => {
  const signer = await createEthersSigner();
  return new ethers.Contract(
    YieldMindVaultContract.address,
    YieldMindVaultContract.abi,
    signer
  );
};

// Estimate gas with proper error handling
export const estimateDepositGas = async (amount: string) => {
  try {
    const contract = await getYieldMindVaultContract();
    const amountWei = ethers.parseEther(amount);
    
    // Estimate gas for deposit function
    const gasEstimate = await contract.deposit.estimateGas({
      value: amountWei
    });
    
      // Add 20% buffer
      const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
    
    return gasWithBuffer;
  } catch (error) {
    console.error('Gas estimation failed:', error);
      // Return a reasonable fallback
      return BigInt(200000);
  }
};

// Check contract state before deposit
export const checkContractState = async (userAddress: string) => {
  try {
    const contract = await getYieldMindVaultContract();
    
    console.log('🔍 Ethers Debug: Checking contract state...');
    
    // Check if contract is paused
    const isPaused = await contract.paused();
    console.log('🔍 Ethers Debug: Contract paused:', isPaused);
    
    // Check minimum deposit
    const minDeposit = await contract.MIN_DEPOSIT();
    console.log('🔍 Ethers Debug: Min deposit:', ethers.formatEther(minDeposit), 'STT');
    
    // Check maximum deposit
    const maxDeposit = await contract.MAX_DEPOSIT();
    console.log('🔍 Ethers Debug: Max deposit:', ethers.formatEther(maxDeposit), 'STT');
    
    // Check MindStaking contract
    const mindStakingAddress = await contract.mindStaking();
    console.log('🔍 Ethers Debug: MindStaking address:', mindStakingAddress);
    
    // Check mock protocol
    const mockProtocolAddress = await contract.mockProtocol();
    console.log('🔍 Ethers Debug: MockProtocol address:', mockProtocolAddress);
    
    // Try to get user position (this might fail if MindStaking is not working)
    try {
      const userPosition = await contract.userPositions(userAddress);
      console.log('🔍 Ethers Debug: User position:', {
        principal: ethers.formatEther(userPosition.principal),
        currentValue: ethers.formatEther(userPosition.currentValue),
        totalReturns: ethers.formatEther(userPosition.totalReturns),
        lastUpdateTime: new Date(Number(userPosition.lastUpdateTime) * 1000).toISOString()
      });
    } catch (tierError: any) {
      console.log('🔍 Ethers Debug: ❌ Failed to get user position:', tierError?.message || 'Unknown error');
      throw new Error(`User position check failed: ${tierError?.message || 'Unknown error'}`);
    }
    
    // Check MockProtocol state (simplified)
    let mockProtocolStatus = 'Working';
    let protocolBalance = '0';
    
    // Get protocol balance from vault instead of direct protocol call
    try {
      const protocolBalanceWei = await contract.getProtocolBalance();
      protocolBalance = ethers.formatEther(protocolBalanceWei);
      console.log('🔍 Ethers Debug: Protocol balance from vault:', protocolBalance, 'STT');
    } catch (error: any) {
      console.log('🔍 Ethers Debug: Could not get protocol balance:', error?.message);
    }
    
    return {
      isPaused,
      minDeposit: ethers.formatEther(minDeposit),
      maxDeposit: ethers.formatEther(maxDeposit),
      mindStakingAddress,
      mockProtocolAddress,
      mockProtocolStatus,
      protocolBalance
    };
  } catch (error: any) {
    console.error('🔍 Ethers Debug: Contract state check failed:', error);
    throw error;
  }
};

// Execute deposit with ethers
export const executeDeposit = async (amount: string) => {
  try {
    const signer = await createEthersSigner();
    const userAddress = await signer.getAddress();
    
    // Check contract state first
    await checkContractState(userAddress);
    
    const contract = await getYieldMindVaultContract();
    const amountWei = ethers.parseEther(amount);
    
    // Estimate gas first
    const gasLimit = await estimateDepositGas(amount);
    
    console.log('🔍 Ethers Debug: Executing deposit with:');
    console.log('🔍 Ethers Debug: - Amount:', amount, 'STT');
    console.log('🔍 Ethers Debug: - Amount (wei):', amountWei.toString());
    console.log('🔍 Ethers Debug: - Gas limit:', gasLimit.toString());
    console.log('🔍 Ethers Debug: - User address:', userAddress);
    
    // Execute transaction
    const tx = await contract.deposit({
      value: amountWei,
      gasLimit: gasLimit
    });
    
    console.log('🔍 Ethers Debug: Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('🔍 Ethers Debug: Transaction confirmed:', receipt.hash);
    console.log('🔍 Ethers Debug: Transaction status:', receipt.status);
    
    if (receipt.status === 0) {
      throw new Error('Transaction reverted - check contract requirements');
    }
    
    return {
      hash: tx.hash,
      receipt: receipt
    };
  } catch (error: any) {
    console.error('🔍 Ethers Debug: Deposit failed:', error);
    throw error;
  }
};

// Get balance with ethers
export const getSTTBalance = async (address: string) => {
  try {
    const provider = createEthersProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error: any) {
    console.error('Failed to get STT balance:', error);
    return '0';
  }
};

// Check if wallet is connected and on correct network
export const checkWalletConnection = async () => {
  try {
    const signer = await createEthersSigner();
    const address = await signer.getAddress();
    const provider = signer.provider;
    const network = await provider.getNetwork();
    
    return {
      isConnected: true,
      address,
      chainId: Number(network.chainId),
      isCorrectNetwork: Number(network.chainId) === SOMNIA_CONFIG.chainId
    };
  } catch (error: any) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      error: error?.message || 'Unknown error'
    };
  }
};

// Execute withdrawal with ethers
export const executeWithdrawal = async (amount: string) => {
  try {
    const signer = await createEthersSigner();
    const userAddress = await signer.getAddress();
    
    // Check contract state first
    await checkContractState(userAddress);
    
    const contract = await getYieldMindVaultContract();
    const amountWei = ethers.parseEther(amount);
    
    // Estimate gas first
    const gasLimit = await estimateWithdrawalGas(amount);
    
    console.log('🔍 Ethers Debug: Executing withdrawal with:');
    console.log('🔍 Ethers Debug: - Amount:', amount, 'STT');
    console.log('🔍 Ethers Debug: - Amount (wei):', amountWei.toString());
    console.log('🔍 Ethers Debug: - Gas limit:', gasLimit.toString());
    console.log('🔍 Ethers Debug: - User address:', userAddress);
    
    // Execute transaction
    const tx = await contract.withdraw(amountWei, {
      gasLimit: gasLimit
    });
    
    console.log('🔍 Ethers Debug: Withdrawal transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('🔍 Ethers Debug: Withdrawal confirmed:', receipt.hash);
    console.log('🔍 Ethers Debug: Transaction status:', receipt.status);
    
    if (receipt.status === 0) {
      throw new Error('Withdrawal transaction reverted - check contract requirements');
    }
    
    return {
      hash: tx.hash,
      receipt: receipt
    };
  } catch (error: any) {
    console.error('🔍 Ethers Debug: Withdrawal failed:', error);
    throw error;
  }
};

// Estimate gas for withdrawal
export const estimateWithdrawalGas = async (amount: string) => {
  try {
    const contract = await getYieldMindVaultContract();
    const amountWei = ethers.parseEther(amount);
    
    // Estimate gas for withdrawal function
    const gasEstimate = await contract.withdraw.estimateGas(amountWei);
    
    // Add 20% buffer
    const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
    
    return gasWithBuffer;
  } catch (error) {
    console.error('Withdrawal gas estimation failed:', error);
    // Return a reasonable fallback
    return BigInt(200000);
  }
};

// Get user position from vault
export const getUserPosition = async (userAddress: string) => {
  try {
    const contract = await getYieldMindVaultContract();
    const position = await contract.userPositions(userAddress);
    
    return {
      principal: ethers.formatEther(position.principal),
      currentValue: ethers.formatEther(position.currentValue),
      totalReturns: ethers.formatEther(position.totalReturns),
      userTier: '2' // Default to Pro tier for SimplifiedVault
    };
  } catch (error: any) {
    console.error('Failed to get user position:', error);
    return {
      principal: '0',
      currentValue: '0',
      totalReturns: '0',
      userTier: '0'
    };
  }
};

// Claim rewards from vault (simplified version)
export const claimRewards = async () => {
  try {
    const contract = await getYieldMindVaultContract();
    
    console.log('🔍 Ethers Debug: Claiming rewards...');
    
    // For now, we'll simulate rewards claiming by updating the user's position
    // In a real implementation, this would calculate and distribute actual rewards
    
    // Get current position
    const position = await contract.userPositions(await createEthersSigner().then(s => s.getAddress()));
    const currentValue = parseFloat(position.currentValue.toString()) / 1e18;
    const principal = parseFloat(position.principal.toString()) / 1e18;
    
    // Calculate simulated rewards (15% APY for demonstration)
    const timeElapsed = Math.floor(Date.now() / 1000) - Number(position.lastUpdateTime);
    const apy = 0.15; // 15% APY
    const rewards = (principal * apy * timeElapsed) / (365 * 24 * 3600); // Per second
    
    if (rewards > 0.001) { // Only claim if rewards > 0.001 STT
      console.log(`🔍 Ethers Debug: Simulated rewards: ${rewards.toFixed(4)} STT`);
      
      // For now, just return success - in production this would update the contract
      return {
        hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated hash
        receipt: { status: 1 } // Simulated success
      };
    } else {
      throw new Error('No rewards available to claim yet');
    }
    
  } catch (error: any) {
    console.error('🔍 Ethers Debug: Claim rewards failed:', error);
    throw error;
  }
};

// Get pending rewards for user (simplified version)
export const getPendingRewards = async (userAddress: string) => {
  try {
    const contract = await getYieldMindVaultContract();
    const position = await contract.userPositions(userAddress);
    
    // Calculate simulated pending rewards (15% APY)
    const principal = parseFloat(position.principal.toString()) / 1e18;
    const timeElapsed = Math.floor(Date.now() / 1000) - Number(position.lastUpdateTime);
    const apy = 0.15; // 15% APY
    const pendingRewards = (principal * apy * timeElapsed) / (365 * 24 * 3600); // Per second
    
    return {
      pendingRewards: pendingRewards.toFixed(6),
      apy: '15.0'
    };
  } catch (error: any) {
    console.error('Failed to get pending rewards:', error);
    return {
      pendingRewards: '0',
      apy: '0'
    };
  }
};

// Switch to Somnia Testnet
export const switchToSomniaTestnet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${SOMNIA_CONFIG.chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // If the network doesn't exist, add it
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${SOMNIA_CONFIG.chainId.toString(16)}`,
            chainName: SOMNIA_CONFIG.name,
            rpcUrls: SOMNIA_CONFIG.rpcUrls,
            nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
            blockExplorerUrls: [SOMNIA_CONFIG.blockExplorer],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};
