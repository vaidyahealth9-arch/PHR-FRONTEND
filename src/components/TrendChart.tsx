import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface HistoryPoint {
  date: string;
  value: string;
  status: string;
}

interface TrendChartProps {
  data: HistoryPoint[];
  unit?: string;
  animate?: boolean;
  className?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, unit = '', animate = true, className = "w-full h-full min-h-[180px]" }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Format data for Recharts
  const graphData = data.map((point) => ({
    ...point,
    numericValue: Number(point.value),
    shortDate: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  })).reverse(); // Reverse to chronological order (oldest to newest)

  const formatTwoDecimals = (value: string | number): string => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return String(value);
    }
    return parsed.toFixed(2);
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="shortDate" 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            tickLine={false} 
            axisLine={false}
            tickMargin={10} 
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`${formatTwoDecimals(value)} ${unit}`, 'Value']}
            labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Line
            type="monotone"
            dataKey="numericValue"
            stroke="#147ea3"
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#147ea3' }}
            isAnimationActive={animate}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
