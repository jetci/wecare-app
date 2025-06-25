"use client";

import React, { useMemo } from "react";
import DashboardLayout from "../layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { exportCSV, exportPDF } from "@/lib/export";
import RoleGuard from "@/components/RoleGuard";
import { Role } from "@/types/roles";
import { useExecutiveMetrics } from "@/hooks/useExecutiveMetrics";
import ExecutiveCharts, { ExecutiveChartData } from "./ExecutiveCharts";

export default function ExecutiveDashboardPage() {
  const { summary, leaderboard, isLoading, isError } = useExecutiveMetrics();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full p-4">Loading...</div>;
  }
  if (isError || !summary || !leaderboard) {
    return <p className="p-4 text-red-500">Failed to load dashboard data</p>;
  }

  const {
    totalDaily,
    totalWeekly,
    totalMonthly,
    avgResponseTime,
    satisfactionScore,
    monthlyTrends,
    ratingTrends,
  } = summary;

  // Convert to Buddhist Era (BE) years
  const monthlyTrendsBE = useMemo(
    () =>
      monthlyTrends.map(({ month, count }) => {
        const [y, m] = month.split("-");
        const beYear = Number(y) + 543;
        return { month: `${beYear}-${m}`, count };
      }),
    [monthlyTrends]
  );

  const ratingTrendsBE = useMemo(
    () =>
      ratingTrends.map(({ date, rating }) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const mon = String(d.getMonth() + 1).padStart(2, "0");
        const beYear = d.getFullYear() + 543;
        return { date: `${day}/${mon}/${beYear}`, rating };
      }),
    [ratingTrends]
  );


  return (
    <RoleGuard allowedRoles={[Role.EXECUTIVE]}>
      <DashboardLayout role="executive">
        <div className="p-4 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard title="วันนี้" count={totalDaily} />
            <KpiCard title="สัปดาห์นี้" count={totalWeekly} />
            <KpiCard title="เดือนนี้" count={totalMonthly} />
            <KpiCard title="Avg Response Time" count={avgResponseTime} suffix="s" />
            <KpiCard title="Satisfaction" count={satisfactionScore} suffix="%" />
          </div>

          {/* Charts */}
          <section className="my-6">
            <ExecutiveCharts data={{
              monthlyRides: monthlyTrendsBE.map(({ month, count }) => ({ month, count })),
              weeklySignups: ratingTrendsBE.map(({ date, rating }) => ({ week: date, users: rating })),
              rideTypeDistribution: summary.rideTypeDistribution || [],
            }} />
          </section>

          {/* Leaderboard */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Top Drivers</h3>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">อันดับ</th>
                  <th className="p-2">ชื่อ</th>
                  <th className="p-2">จำนวน</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((d, i) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{d.name}</td>
                    <td className="p-2">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              data-testid="export-csv"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => exportCSV(summary)}
            >
              ส่งออก CSV
            </button>
            <button
              data-testid="export-pdf"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => exportPDF(summary)}
            >
              ส่งออก PDF
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}