import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

/**
 * Placeholder responsive chart component for ReportsPage.
 * Renders a container with data-testid for testing.
 */
type ReportsChartProps = {
  data: { name: string; value: number }[];
};

export default function ReportsChart({ data }: ReportsChartProps) {
  if (!data || data.length === 0) return <p data-testid="reports-chart-empty">ไม่มีข้อมูลกราฟ</p>;
  return (
    <div data-testid="reports-chart" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
