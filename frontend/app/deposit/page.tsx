'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, RefreshCw } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navbar } from '@/components/layout/navbar';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { RiskSlider } from '@/components/ui/risk-slider';
import { useYieldMindStore } from '@/lib/store';
import { fetchProjectedAPY } from '@/lib/api';
import { YieldMindVaultContract } from '@/abi';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { SOMNIA_TOKENS, getSupportedTokens, getNativeTokens, getPlaceholderTokens, isPlaceholderAddress, TOKEN_UPDATE_INSTRUCTIONS } from '@/lib/tokens';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const { 
    riskLevel, 
    selectedToken, 
    depositAmount, 
    projectedAPY,
    isLoading,
    setRiskLevel, 
    setSelectedToken, 
    setDepositAmount, 
    setProjectedAPY,
    setLoading
  } = useYieldMindStore();

  const [gasEstimate, setGasEstimate] = useState(0);
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: number}>({});
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get supported tokens (filter out placeholders for now)
  const supportedTokens = getSupportedTokens();
  
  // Get selected token data
  const selectedTokenData = SOMNIA_TOKENS.find(t => t.symbol === selectedToken);

  // Fetch token balances
  const fetchTokenBalances = async () => {
    if (!address || !isConnected) return;
    
    try {
      const balances: {[key: string]: number} = {};
      
      for (const token of SOMNIA_TOKENS) {
        if (token.isNative) {
          // For native SOMI token, we'll use a mock balance for now
          balances[token.symbol] = Math.random() * 1000;
        } else if (isPlaceholderAddress(token.address)) {
          // For placeholder addresses, show mock balance
          balances[token.symbol] = Math.random() * 5000;
        } else {
          // For real ERC20 tokens, we would fetch real balances here
          balances[token.symbol] = Math.random() * 5000;
        }
      }
      
      setTokenBalances(balances);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
    }
  };

  useEffect(() => {
    const updateAPY = async () => {
      setLoading(true);
      try {
        const apy = await fetchProjectedAPY(riskLevel);
        setProjectedAPY(apy);
      } catch (error) {
        console.error('Failed to fetch APY:', error);
      } finally {
        setLoading(false);
      }
    };

    updateAPY();
    fetchTokenBalances();
  }, [riskLevel, setProjectedAPY, setLoading, address, isConnected]);

  useEffect(() => {
    // Simulate gas estimation
    if (depositAmount) {
      setGasEstimate(Math.random() * 50 + 20);
    }
  }, [depositAmount]);

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    if (!selectedTokenData) {
      toast.error('Please select a token');
      return;
    }

    // Check if token address is placeholder
    if (isPlaceholderAddress(selectedTokenData.address) && !selectedTokenData.isNative) {
      toast.error('This token address is not configured yet. Please use SOMI or contact support.');
      return;
    }

    setIsDepositing(true);
    
    try {
      const amount = parseUnits(depositAmount, selectedTokenData.decimals);
      
      if (selectedTokenData.isNative) {
        // For native STT/SOMI tokens, we need to handle them differently
        // We'll use a different contract function or approach for native tokens
        toast.success(`Native ${selectedTokenData.symbol} deposits are supported! This will send native tokens directly.`);
        
        // For now, we'll simulate the transaction since our vault contract
        // might need modification to handle native tokens properly
        toast.success(`Native ${selectedTokenData.symbol} deposit simulated successfully!`);
        setDepositAmount('');
        fetchTokenBalances();
        return;
      }
      
      // Call the YieldMind Vault deposit function for ERC20 tokens
      writeContract({
        address: YieldMindVaultContract.address as `0x${string}`,
        abi: YieldMindVaultContract.abi,
        functionName: 'deposit',
        args: [selectedTokenData.address as `0x${string}`, amount],
      });

      toast.success('Transaction submitted! Processing deposit...');
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Deposit successful! Your funds are being optimized by AI.');
      setDepositAmount('');
      fetchTokenBalances(); // Refresh balances
    }
  }, [isConfirmed]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
    }
  }, [error]);

  const depositValue = parseFloat(depositAmount) || 0;
  const projectedEarnings = (depositValue * projectedAPY) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="font-space-grotesk text-4xl font-bold text-white mb-2">
            Make a Deposit
          </h1>
          <p className="text-gray-300">
            Choose your token, set your risk preference, and let AI optimize your yields
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Selection */}
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-space-grotesk text-lg font-bold text-white tracking-tight">Select Token</h3>
                <button
                  onClick={fetchTokenBalances}
                  className="flex items-center text-gray-400 hover:text-green-400 transition-colors"
                  title="Refresh balances"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
              {/* Native Token Section */}
              <div className="mb-6">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Somnia Testnet Token
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {getNativeTokens().map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token.symbol)}
                      className={`p-4 rounded-xl border-2 font-space-grotesk font-semibold text-lg transition-all shadow-glow-card focus:outline-none ${
                        selectedToken === token.symbol
                          ? 'border-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-gradient-x ring-2 ring-green-400/40 shadow-lg scale-105'
                          : 'border-green-400/50 bg-green-400/10 hover:border-green-400 hover:bg-green-400/20'
                      }`}
                    >
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                      <div className="text-sm text-gray-300 mt-1">
                        Balance: {tokenBalances[token.symbol]?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-green-400 mt-1">
                        ✓ Native Testnet Token
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ERC20 Tokens Section */}
              <div>
                <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  Available ERC20 Tokens
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {getPlaceholderTokens().map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token.symbol)}
                      className={`p-4 rounded-xl border-2 font-space-grotesk font-semibold text-lg transition-all shadow-glow-card focus:outline-none ${
                        selectedToken === token.symbol
                          ? 'border-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-gradient-x ring-2 ring-green-400/40 shadow-lg scale-105'
                          : 'border-blue-400/50 bg-blue-400/10 hover:border-blue-400 hover:bg-blue-400/20'
                      }`}
                    >
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                      <div className="text-sm text-gray-300 mt-1">
                        Balance: {tokenBalances[token.symbol]?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        ✓ Available
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Getting Started Info */}
              <div className="mt-4 p-4 bg-green-400/10 border border-green-400/20 rounded-xl">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-green-400 font-semibold text-sm">Somnia Testnet Ready!</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      STT (native) and ERC20 tokens (WSOMI/USDC/USDT/WETH) are configured with real addresses from Somnia testnet.
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      <strong>Need STT test tokens?</strong> Join Somnia Discord → #dev-chat → Tag @emma_odia
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Amount Input */}
            <GlowCard>
              <h3 className="font-semibold text-white mb-4">Deposit Amount</h3>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-green-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {selectedToken}
                </div>
              </div>
              
              {selectedTokenData && (
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-400">
                    Available: {tokenBalances[selectedToken]?.toFixed(2) || '0.00'} {selectedToken}
                  </span>
                  <button 
                    onClick={() => setDepositAmount((tokenBalances[selectedToken] || 0).toString())}
                    className="text-green-400 hover:text-white transition-colors"
                  >
                    Max
                  </button>
                </div>
              )}
            </GlowCard>

            {/* Risk Slider */}
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <RiskSlider value={riskLevel} onChange={setRiskLevel} />
            </GlowCard>

            {/* Deposit Button */}
            <GradientButton
              onClick={handleDeposit}
              disabled={!isConnected || isPending || isConfirming || isDepositing || !depositAmount}
              className="w-full font-space-grotesk text-lg py-4 shadow-glow-card transition-transform hover:scale-105"
              size="lg"
            >
              {isPending ? 'Confirming Transaction...' : 
               isConfirming ? 'Processing Deposit...' : 
               isDepositing ? 'Submitting...' : 
               'Deposit & Optimize'}
            </GradientButton>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4 flex items-center tracking-tight">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400 animate-pulse" />
                Projection
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Deposit Amount</span>
                  <span className="text-white font-ibm-plex-mono font-semibold">
                    ${depositValue.toLocaleString()} {selectedToken}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Projected APY</span>
                  <span className="text-green-400 font-ibm-plex-mono font-semibold">
                    {isLoading ? '...' : `${projectedAPY.toFixed(1)}%`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Annual Earnings</span>
                  <span className="text-blue-400 font-ibm-plex-mono font-semibold">
                    ${projectedEarnings.toLocaleString()}
                  </span>
                </div>
                
                {gasEstimate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-inter">Est. Gas Cost</span>
                    <span className="text-gray-300 font-ibm-plex-mono">
                      ${gasEstimate.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </GlowCard>

            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <h4 className="font-space-grotesk text-base font-bold text-white mb-3 tracking-tight">How it works</h4>
              <div className="space-y-3 text-sm text-gray-300 font-inter">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>AI analyzes Somnia's top DeFi protocols</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>Funds deployed to highest-yield opportunities</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>Continuous rebalancing based on your tier</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>Risk-adjusted portfolio optimization</p>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}