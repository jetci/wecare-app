import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const totalDaily = await prisma.ride.count({ where: { date: { gte: startOfDay } } });

  const startWeek = new Date(now);
  startWeek.setDate(startWeek.getDate() - 7);
  const totalWeekly = await prisma.ride.count({ where: { date: { gte: startWeek } } });

  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalMonthly = await prisma.ride.count({ where: { date: { gte: startMonth } } });

  // Placeholder for avgResponseTime & satisfactionScore
  const avgResponseTime = 0;
  const satisfactionScore = 0;

  // Trends data (empty or implement grouping logic)
  const monthlyTrends: { month: string; count: number }[] = [];
  const ratingTrends: { date: string; rating: number }[] = [];

  return NextResponse.json({ totalDaily, totalWeekly, totalMonthly, avgResponseTime, satisfactionScore, monthlyTrends, ratingTrends });
}
