'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AllocationData {
  chain: string;
  protocol: string;
  amount: number;
  apy: number;
  color: string;
}

interface PortfolioPieProps {
  data: AllocationData[];
}

export function PortfolioPie({ data }: PortfolioPieProps) {
  const pieData = data.map(item => ({
    name: `${item.chain} - ${item.protocol}`,
    value: item.amount,
    color: item.color,
    apy: item.apy,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-green-400">${data.value.toLocaleString()}</p>
          <p className="text-blue-400">{data.apy}% APY</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => (
              <span style={{ color: '#E2E8F0', fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}