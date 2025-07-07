import { NextResponse } from 'next/server';

interface HealthPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
}

export async function GET() {
  // Generate sample history for last 24 hours at hourly intervals
  const now = Date.now();
  const data: HealthPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toISOString();
    data.push({
      timestamp: time,
      cpuUsage: Math.floor(40 + Math.random() * 40),
      memoryUsage: Math.floor(30 + Math.random() * 50),
      dbConnections: Math.floor(5 + Math.random() * 15),
    });
  }
  return NextResponse.json(data);
}
