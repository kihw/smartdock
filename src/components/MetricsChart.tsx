import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricsChartProps {
  data: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    network?: number;
  }>;
  type?: 'line' | 'area';
  height?: number;
  showGrid?: boolean;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  type = 'line',
  height = 200,
  showGrid = true
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{formatTime(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cpu"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            name="CPU"
          />
          <Area
            type="monotone"
            dataKey="memory"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            name="Mémoire"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatTime}
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="CPU"
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          name="Mémoire"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};