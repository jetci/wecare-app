import React from 'react';
import { useExecutiveFilters } from '@/hooks/useExecutiveFilters';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { RideTypeSelect } from '@/components/filters/RideTypeSelect';
import { filterDataByRange } from '@/utils/chartFilters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export type ExecutiveChartData = {
  monthlyRides: { month: string; count: number }[];
  weeklySignups: { week: string; users: number }[];
  rideTypeDistribution: { type: string; value: number }[];
};

interface ExecutiveChartsProps {
  data: ExecutiveChartData;
  isLoading?: boolean;
  error?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const ExecutiveCharts: React.FC<ExecutiveChartsProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <div className="p-4">Loading charts...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading charts: {error}</div>;

  const { monthlyRides, weeklySignups, rideTypeDistribution } = data;

  // Calculate full date range
  const allDates: Date[] = [
    ...monthlyRides.map(item => {
      const [y, m] = item.month.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }),
    ...weeklySignups.map(item => new Date(item.week)),
  ];
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  const { filters, setDateRange, setRideType } = useExecutiveFilters(
    { dateRange: { start: minDate, end: maxDate }, rideType: undefined },
    () => {}
  );

  // Apply filters
  const filteredMonthly = filterDataByRange(
    monthlyRides,
    item => {
      const [y, m] = item.month.split('-').map(Number);
      return new Date(y, m - 1, 1);
    },
    filters.dateRange.start,
    filters.dateRange.end
  );
  const filteredWeekly = filterDataByRange(
    weeklySignups,
    item => new Date(item.week),
    filters.dateRange.start,
    filters.dateRange.end
  );
  const filteredTypes = filters.rideType
    ? rideTypeDistribution.filter(item => item.type === filters.rideType)
    : rideTypeDistribution;

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <DateRangePicker
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onChange={setDateRange}
        />
        <RideTypeSelect
          value={filters.rideType}
          options={rideTypeDistribution.map(d => d.type)}
          onChange={setRideType}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Monthly Rides */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Monthly Rides</h3>
          {filteredMonthly.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredMonthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>ไม่มีข้อมูลตรงเงื่อนไขนี้</p>
          )}
        </div>

        {/* Weekly Signups */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Weekly Signups</h3>
          {filteredWeekly.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredWeekly}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke={COLORS[1]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>ไม่มีข้อมูลตรงเงื่อนไขนี้</p>
          )}
        </div>

        {/* Ride Type Distribution */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Ride Type Distribution</h3>
          {filteredTypes.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={filteredTypes}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {filteredTypes.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>ไม่มีข้อมูลตรงเงื่อนไขนี้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCharts;
