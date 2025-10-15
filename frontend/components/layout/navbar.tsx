'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { TrendingUp, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
// import { motion } from 'framer-motion'; // Uncomment when adding animation

export function Navbar() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/deposit', label: 'Deposit' },
    { href: '/withdraw', label: 'Withdraw' },
    { href: '/premium', label: (<><Zap className="w-4 h-4" /><span>Premium</span></>) },
  ];
  return (
    // <motion.header ...> for animation in future
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg group-hover:scale-110 transition-transform shadow-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-tight">
              NeuroWealth
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 relative">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    `relative font-medium transition-colors px-1 py-0.5 flex items-center gap-1 ` +
                    (isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white')
                  }
                >
                  {label}
                  {/* Animated gradient underline for active link */}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-gradient-x" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-4">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl blur-xl opacity-80 group-hover:opacity-100 transition-all pointer-events-none bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-gradient-x" />
              <div className="relative z-10 px-4 py-2 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-[length:200%_200%] animate-gradient-x hover:shadow-green-500/30 transition-transform hover:scale-105">
                <ConnectButton
                  chainStatus="icon"
                  accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                  }}
                  showBalance={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}