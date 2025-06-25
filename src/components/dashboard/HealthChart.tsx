"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HealthPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
}

interface HealthChartProps {
  data: HealthPoint[];
}

export default function HealthChart({ data }: HealthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(str) => str.slice(11, 16)} />
        <YAxis />
        <Tooltip labelFormatter={(label) => `Time: ${label}`} />
        <Legend />
        <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" name="CPU %" dot={false} />
        <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" name="Memory %" dot={false} />
        <Line type="monotone" dataKey="dbConnections" stroke="#ffc658" name="DB Conn" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
