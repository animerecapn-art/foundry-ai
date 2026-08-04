'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'rose';
  index?: number;
}

const colorMap = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/50',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/50',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/50',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
    border: 'border-orange-100 dark:border-orange-900/50',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/50',
  },
};

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = 'purple',
  index = 0,
}: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'relative rounded-xl border p-5 shadow-card transition-shadow hover:shadow-card-hover cursor-default',
        'bg-card',
        colors.border
      )}
    >
      {/* Subtle gradient background */}
      <div className={cn('absolute inset-0 rounded-xl opacity-40', colors.bg)} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="mt-2 text-3xl font-display font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn('p-2.5 rounded-xl', colors.icon)}>
            {icon}
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                isPositive && 'text-emerald-600 dark:text-emerald-400',
                isNegative && 'text-red-500 dark:text-red-400',
                !isPositive && !isNegative && 'text-muted-foreground'
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
