'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Code, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { GlowCard } from '@/components/ui/glow-card';
import Link from 'next/link';

export default function ComparisonPage() {
  const [selectedTab, setSelectedTab] = useState<'wagmi' | 'ethers'>('wagmi');

  const comparisonData = {
    wagmi: {
      name: 'Wagmi + Viem',
      description: 'React hooks for Ethereum with Viem under the hood',
      pros: [
        'React-first approach with hooks',
        'Type-safe with TypeScript',
        'Built-in wallet connection UI (RainbowKit)',
        'Automatic retry logic',
        'Optimistic updates',
        'Built-in caching with React Query'
      ],
      cons: [
        'Complex error handling',
        'Gas estimation can be unreliable',
        'Multiple abstraction layers',
        'Harder to debug transaction failures',
        'Dependency on React Query',
        'Less control over transaction flow'
      ],
      codeExample: `// Wagmi implementation
const { writeContract, data: hash, error } = useWriteContract();
const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

const handleDeposit = async () => {
  const result = writeContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'deposit',
    args: [amountWei],
    value: amountWei,
    gas: gasLimit,
  });
};`,
      useCase: 'Best for: React applications that need rapid development with built-in UI components'
    },
    ethers: {
      name: 'Ethers.js',
      description: 'Direct Ethereum library with full control over transactions',
      pros: [
        'Simple and direct API',
        'Excellent error handling',
        'Reliable gas estimation',
        'Full control over transaction flow',
        'Better debugging capabilities',
        'No React dependencies'
      ],
      cons: [
        'More boilerplate code',
        'Manual wallet connection handling',
        'No built-in UI components',
        'Manual state management',
        'No automatic caching',
        'Requires more setup'
      ],
      codeExample: `// Ethers.js implementation
const executeDeposit = async (amount: string) => {
  const contract = await getYieldMindVaultContract();
  const amountWei = ethers.parseEther(amount);
  
  const gasLimit = await estimateDepositGas(amount);
  
  const tx = await contract.deposit(amountWei, {
    value: amountWei,
    gasLimit: gasLimit
  });
  
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
};`,
      useCase: 'Best for: Applications that need reliable transactions and full control over the flow'
    }
  };

  const currentData = comparisonData[selectedTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="font-space-grotesk text-4xl font-bold text-white mb-2">
            Wagmi vs Ethers.js Comparison
          </h1>
          <p className="text-gray-300">
            Understanding the differences between Wagmi and Ethers.js for your YieldMind transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tab Selection */}
          <div className="lg:col-span-1">
            <GlowCard className="sticky top-24">
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4">Choose Implementation</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedTab('wagmi')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedTab === 'wagmi'
                      ? 'border-blue-400 bg-blue-400/20 ring-2 ring-blue-400/40'
                      : 'border-gray-600 bg-gray-700/50 hover:border-blue-400/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Wagmi + Viem</div>
                      <div className="text-sm text-gray-400">React hooks approach</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTab('ethers')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedTab === 'ethers'
                      ? 'border-green-400 bg-green-400/20 ring-2 ring-green-400/40'
                      : 'border-gray-600 bg-gray-700/50 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Ethers.js</div>
                      <div className="text-sm text-gray-400">Direct library approach</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-semibold text-white mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <Link 
                    href="/deposit" 
                    className="block p-3 rounded-lg bg-blue-400/10 border border-blue-400/20 hover:bg-blue-400/20 transition-colors"
                  >
                    <div className="font-medium text-blue-400">Try Wagmi Version</div>
                    <div className="text-sm text-gray-400">Current implementation</div>
                  </Link>
                  <Link 
                    href="/deposit" 
                    className="block p-3 rounded-lg bg-green-400/10 border border-green-400/20 hover:bg-green-400/20 transition-colors"
                  >
                    <div className="font-medium text-green-400">Try Ethers Version</div>
                    <div className="text-sm text-gray-400">Alternative implementation</div>
                  </Link>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <GlowCard>
              <div className="flex items-center space-x-3 mb-4">
                {selectedTab === 'wagmi' ? (
                  <Code className="w-6 h-6 text-blue-400" />
                ) : (
                  <Zap className="w-6 h-6 text-green-400" />
                )}
                <h2 className="font-space-grotesk text-2xl font-bold text-white">
                  {currentData.name}
                </h2>
              </div>
              <p className="text-gray-300 mb-6">{currentData.description}</p>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Recommended Use Case:</div>
                <div className="text-white font-medium">{currentData.useCase}</div>
              </div>
            </GlowCard>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlowCard>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Advantages</h3>
                </div>
                <ul className="space-y-3">
                  {currentData.pros.map((pro, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </GlowCard>

              <GlowCard>
                <div className="flex items-center space-x-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-white">Disadvantages</h3>
                </div>
                <ul className="space-y-3">
                  {currentData.cons.map((con, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </div>

            {/* Code Example */}
            <GlowCard>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Code Example</h3>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{currentData.codeExample}</code>
                </pre>
              </div>
            </GlowCard>

            {/* Transaction Failure Analysis */}
            <GlowCard>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Transaction Failure Analysis</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">Common Issues with Wagmi</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Gas estimation failures due to complex abstraction layers</li>
                    <li>• Error messages are often generic and hard to debug</li>
                    <li>• Transaction state management can be inconsistent</li>
                    <li>• RPC connection issues are not always handled gracefully</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Why Ethers.js Might Help</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Direct control over gas estimation and transaction parameters</li>
                    <li>• Clear, specific error messages from the Ethereum network</li>
                    <li>• Simpler transaction flow with fewer abstraction layers</li>
                    <li>• Better handling of network connectivity issues</li>
                  </ul>
                </div>
              </div>
            </GlowCard>

            {/* Recommendation */}
            <GlowCard>
              <h3 className="font-semibold text-white mb-4">Our Recommendation</h3>
              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <p className="text-gray-300 mb-3">
                  Given the transaction failures you&apos;re experiencing, we recommend trying the Ethers.js implementation first. 
                  It provides more direct control over the transaction process and better error handling.
                </p>
                <div className="flex space-x-3">
                  <Link 
                    href="/deposit"
                    className="px-4 py-2 bg-green-400 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Try Ethers.js Version
                  </Link>
                  <Link 
                    href="/deposit"
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Keep Wagmi Version
                  </Link>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
