"use client";

import React, { useEffect, useState } from 'react';
// import { useState } from "react"
import useSWR from "swr";
import { parse as json2csv } from "json2csv";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { format } from "date-fns";
import ReportsChart from './ReportsChart';
import { ReportData } from '@/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReportsPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [filters, setFilters] = useState({ district: "", province: "", role: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const query = type && from && to
    ? `/api/reports?type=${type}&from=${from}&to=${to}` +
      `&district=${filters.district}&province=${filters.province}&role=${filters.role}&status=${filters.status}`
    : null;
  const { data, error } = useSWR<ReportData[]>(query, fetcher);

  const handleExportCSV = () => {
    if (!data) return;
    setLoading(true);
    try {
      const csv = json2csv(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${from}_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export CSV สำเร็จ");
    } catch (e) {
      toast.error("Export CSV ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    setLoading(true);
    try {
      const doc = new jsPDF();
      doc.text(JSON.stringify(data, null, 2), 10, 10);
      doc.save(`${type}_${from}_${to}.pdf`);
      toast.success("Export PDF สำเร็จ");
    } catch {
      toast.error("Export PDF ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  async function handleSchedule() {
    setScheduleError(null);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setScheduleError('กรุณาระบุอีเมลให้ถูกต้อง');
      return;
    }
    setScheduleLoading(true);
    try {
      const res = await fetch('/api/reports/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, from, to, filters, email, frequency }) });
      if (!res.ok) throw new Error();
      toast.success('Schedule created');
      setScheduleOpen(false);
    } catch {
      setScheduleError('ไม่สามารถตั้งเวลาได้ กรุณาลองใหม่');
    } finally {
      setScheduleLoading(false);
    }
  }

  useEffect(() => {
    if (scheduleOpen) {
      setEmail('');
      setFrequency('daily');
      setScheduleError(null);
    }
  }, [scheduleOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && scheduleOpen && setScheduleOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scheduleOpen]);

  return (
    <div className="p-4 space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Report Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2">
            <option value="">เลือกประเภทรายงาน</option>
            <option value="PatientSummary">Patient Summary Report</option>
            <option value="RideActivity">Ride Activity Report</option>
            <option value="OfficerPerformance">Officer Performance Report</option>
            <option value="SystemUsage">System Usage Log</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">District</label>
          <input value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Province</label>
          <input value={filters.province} onChange={e => setFilters({ ...filters, province: e.target.value })} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Role</label>
          <input value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <input value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full border rounded p-2" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button data-testid="export-csv" onClick={handleExportCSV} disabled={!data || loading} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Export as CSV
        </button>
        <button data-testid="export-pdf" onClick={handleExportPDF} disabled={!data || loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Export as PDF
        </button>
        <button data-testid="schedule-open-button" onClick={() => setScheduleOpen(true)} className="bg-gray-600 text-white px-4 py-2 rounded">
          Schedule Email Report
        </button>
      </div>

      {/* Data Preview */}
      {error && <p data-testid="reports-error" className="text-red-500">Error loading data</p>}
      {!data && <p data-testid="reports-prompt">กรุณาเลือกฟิลเตอร์และประเภทรายงาน</p>}
      {data && (
        <>
          <ReportsChart data={data} />
          <pre data-testid="reports-json" className="bg-gray-100 p-4 rounded max-h-64 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}

      {/* Schedule Modal */}
      {scheduleOpen && (
        <div data-testid="schedule-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Schedule Email Report</h2>
            <div className="mb-2">
              <label htmlFor="schedule-email" className="block mb-1">Email</label>
              <input id="schedule-email" data-testid="schedule-email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div className="mb-4">
              <label htmlFor="schedule-frequency" className="block mb-1">Frequency</label>
              <select id="schedule-frequency" data-testid="schedule-frequency-select" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full border rounded p-2">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button data-testid="schedule-cancel-button" onClick={() => setScheduleOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button data-testid="schedule-submit-button" onClick={handleSchedule} disabled={scheduleLoading} className="px-4 py-2 bg-blue-600 text-white rounded" aria-label="Schedule report">
                {scheduleLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
            {scheduleError && <p data-testid="schedule-error" className="text-red-500 mt-2">{scheduleError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
