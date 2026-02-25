import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  color?: 'green' | 'gold' | 'blue' | 'purple';
  subtitle?: string;
}

const colorMap = {
  green: 'text-primary border-primary/30 bg-primary/10',
  gold: 'text-secondary border-secondary/30 bg-secondary/10',
  blue: 'text-chart-3 border-chart-3/30 bg-chart-3/10',
  purple: 'text-chart-5 border-chart-5/30 bg-chart-5/10',
};

export default function BalanceCard({ title, amount, icon: Icon, color = 'green', subtitle }: BalanceCardProps) {
  return (
    <div className={`rounded-xl border p-4 card-glow ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium opacity-80">{title}</span>
      </div>
      <p className="text-2xl font-black">৳{amount.toLocaleString()}</p>
      {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
    </div>
  );
}
