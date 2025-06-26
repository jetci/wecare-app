import React from 'react'
import useSWR from 'swr'
import { SummaryCard } from '../ui/SummaryCard'
import { ChartCard } from '../ui/ChartCard'
import { Heatmap } from '../ui/Heatmap'
import { Table } from '../ui/Table'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const ExecutiveDashboard: React.FC = () => {
  const { data: kpi, error: kpiError } = useSWR('/api/reports/kpi', fetcher)
  const { data: trends, error: trendsError } = useSWR('/api/reports/trends', fetcher)
  const { data: heatmap, error: heatmapError } = useSWR('/api/reports/heatmap', fetcher)
  const { data: leaderboard, error: lbError } = useSWR('/api/reports/leaderboard', fetcher)

  if (kpiError || trendsError || heatmapError || lbError) return <p className="p-4 text-red-500">Failed to load dashboard data</p>

  return (
    <div className="p-4 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpi ? (
          <>
            <SummaryCard title="Total Rides" value={kpi.totalRides} />
            <SummaryCard title="Avg Response Time" value={`${kpi.avgResponseTime} mins`} />
            <SummaryCard title="Satisfaction" value={`${kpi.satisfaction}%`} />
          </>
        ) : (
          <p>Loading KPI...</p>
        )}
      </div>

      {/* Trends Chart */}
      <ChartCard title="Trends" data={trends || []} type="line" />

      {/* Heatmap */}
      <div className="h-96">
        <h2 className="text-xl font-semibold mb-2">Ride Requests Heatmap</h2>
        {heatmap ? <Heatmap data={heatmap} /> : <p>Loading Heatmap...</p>}
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Top Performers</h2>
        {leaderboard ? (
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'completed', label: 'Rides Completed' },
              { key: 'rating', label: 'Rating' },
            ]}
            data={leaderboard.map((u: any) => ({
              name: `${u.firstName} ${u.lastName}`,
              completed: u.completed,
              rating: u.rating,
            }))}
          />
        ) : (
          <p>Loading Leaderboard...</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Export PDF</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded">Export CSV</button>
        <button className="px-4 py-2 bg-gray-200 rounded">Schedule Email</button>
      </div>
    </div>
  )
}

export default ExecutiveDashboard
