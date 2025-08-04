'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface SummaryData {
  totalPatients: number;
  byGroup: { group: string; count: number }[];
  byArea: { changwat: string; amphoe: string; count: number }[];
}

export default function ReportPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startDate && endDate) fetchSummary();
  }, [startDate, endDate]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate.toISOString().slice(0,10));
      if (endDate) params.set('endDate', endDate.toISOString().slice(0,10));
      const res = await fetch(`/api/reports/summary?${params}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">รายงานสรุป</h1>
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm">Start Date</label>
          <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <DatePicker selected={endDate} onChange={date => setEndDate(date)} />
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg">Total Patients</h2>
            <p className="text-3xl font-semibold">{data.totalPatients}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-md font-medium mb-2">Patients by Group</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byGroup}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-md font-medium mb-2">Patients by Area</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.byArea}
                    dataKey="count"
                    nameKey="amphoe"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.byArea.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">จังหวัด</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">อำเภอ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">จำนวน</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.byArea.map((area, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-700">{area.changwat}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{area.amphoe}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{area.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
