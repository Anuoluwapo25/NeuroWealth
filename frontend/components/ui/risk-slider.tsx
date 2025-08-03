'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface RiskSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RiskSlider({ value, onChange, min = 0, max = 100 }: RiskSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getRiskLevel = (val: number) => {
    if (val < 30) return { label: 'Conservative', color: 'text-green-400' };
    if (val < 70) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Aggressive', color: 'text-red-400' };
  };

  const riskLevel = getRiskLevel(value);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">Risk Tolerance</h3>
        <span className={`font-medium ${riskLevel.color}`}>
          {riskLevel.label} ({value}%)
        </span>
      </div>

      <div className="relative">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 animate-gradient-x"
            style={{ width: `${value}%`, backgroundSize: '200% 200%' }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.2 }}
          />
          {/* Animated moving gradient overlay for playful effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 opacity-30 blur-md animate-gradient-x" />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
        />

        <motion.div
          className="absolute top-1/2 w-6 h-6 bg-white border-2 border-slate-600 rounded-full shadow-glow-card cursor-pointer transition-transform"
          style={{ 
            left: `calc(${value}% - 12px)`,
            transform: 'translateY(-50%)'
          }}
          animate={{ 
            scale: isDragging ? 1.25 : 1,
            boxShadow: isDragging
              ? '0 0 0 8px rgba(74,222,128,0.18), 0 0 32px 8px rgba(34,197,94,0.25), 0 0 0 2px #fff'
              : '0 4px 18px 0px rgba(0,0,0,0.22)',
            filter: isDragging ? 'brightness(1.1)' : 'none'
          }}
          transition={{ duration: 0.18 }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-green-400 font-semibold">Conservative</div>
          <div className="text-gray-400">5-8% APY</div>
          <div className="text-gray-500 text-xs">Blue chip protocols</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-semibold">Moderate</div>
          <div className="text-gray-400">8-15% APY</div>
          <div className="text-gray-500 text-xs">Balanced exposure</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-semibold">Aggressive</div>
          <div className="text-gray-400">15-25% APY</div>
          <div className="text-gray-500 text-xs">Higher volatility</div>
        </div>
      </div>
    </div>
  );
}