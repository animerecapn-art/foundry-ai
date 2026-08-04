'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types';

interface DonutChartProps {
  data: ChartDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color?: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-popover p-3 shadow-lg">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-xs text-muted-foreground">{payload[0].value} ideas</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function DonutChart({ data, height = 180, innerRadius = 55, outerRadius = 75 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          nameKey="label"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8B5CF6'} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={<CustomLegend />}
          layout="vertical"
          align="right"
          verticalAlign="middle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
