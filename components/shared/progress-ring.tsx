'use client';

import { motion } from 'framer-motion';
import { cn, getScoreColor } from '@/lib/utils';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  color?: string;
  animate?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
  showValue = true,
  color,
  animate = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const scoreColor = color || (
    value >= 80 ? '#10B981' :
    value >= 60 ? '#F59E0B' :
    value >= 40 ? '#F97316' : '#EF4444'
  );

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.22, color: scoreColor }}
          >
            {value}
          </span>
        )}
        {label && (
          <span
            className="text-muted-foreground font-medium leading-none mt-0.5"
            style={{ fontSize: size * 0.12 }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="text-muted-foreground/60 leading-none mt-0.5"
            style={{ fontSize: size * 0.10 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
