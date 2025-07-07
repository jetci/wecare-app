import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';

interface WeeklyTrend {
  week: string;
  count: number;
}

interface ReportsChartProps {
  data?: {
    weeklyTrends: WeeklyTrend[];
  };
}

export default function ReportsChart({ data }: ReportsChartProps) {
  const trends = data?.weeklyTrends || [];
  return (
    <div className="h-64 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#1976d2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
