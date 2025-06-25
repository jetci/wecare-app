import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import ThaiDatePicker from '@/components/ui/ThaiDatePicker'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type ReportType = 'PatientSummary' | 'RideHistory' | 'Performance' | 'Logs'
const reportOptions: { label: string; value: ReportType }[] = [
  { label: 'Patient Summary', value: 'PatientSummary' },
  { label: 'Ride History', value: 'RideHistory' },
  { label: 'Performance', value: 'Performance' },
  { label: 'Logs', value: 'Logs' },
]

export const ReportsExport: React.FC = () => {
  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)
  const [type, setType] = useState<ReportType>('PatientSummary')
  const [district, setDistrict] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('type', type)
    if (from) params.set('from', from.toISOString())
    if (to) params.set('to', to.toISOString())
    if (district) params.set('district', district)
    if (roleFilter) params.set('role', roleFilter)
    if (statusFilter) params.set('status', statusFilter)
    return `/api/reports?${params.toString()}`
  }, [from, to, type, district, roleFilter, statusFilter])

  type ReportRow = Record<string, unknown>
  const { data, error, mutate } = useSWR<ReportRow[]>(query, fetcher)

  const handleExportCSV = () => {
    if (!data) return
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${type}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.text(`Report: ${type}`, 14, 20)
    const cols = data.length ? Object.keys(data[0]) : []
    const rows = data.map((row: ReportRow) =>
      cols.map(c => (row[c] !== undefined ? String(row[c]) : ''))
    )
    // @ts-expect-error: doc.autoTable typing
    doc.autoTable({ head: [cols], body: rows, startY: 30 })
    doc.save(`${type}_${Date.now()}.pdf`)
  }

  const isEmpty = data && Array.isArray(data) && data.length === 0

  return (
    <div className="p-4 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">Reports Export</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Report Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as ReportType)}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            {reportOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">From</label>
          <ThaiDatePicker
            selected={from}
            onChange={date => setFrom(date)}
            className="mt-1 w-full border rounded px-2 py-1"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <ThaiDatePicker
            selected={to}
            onChange={date => setTo(date)}
            className="mt-1 w-full border rounded px-2 py-1"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div>
          <label className="block text-sm">District</label>
          <input
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Role</label>
          <input
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Status</label>
          <input
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => mutate()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >Filter</button>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={!data || isEmpty}
        >Export CSV</button>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={!data || isEmpty}
        >Export PDF</button>
      </div>

      <div>
        {error && <p className="text-red-500">Failed to load data</p>}
        {!data ? (
          <p>Loading...</p>
        ) : isEmpty ? (
          <p>No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  {Object.keys(data[0]).map(col => (
                    <th key={col} className="px-2 py-1 border">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row: ReportRow, idx: number) => (
                  <tr key={idx}>
                    {Object.keys(row).map(col => (
                      <td key={col} className="px-2 py-1 border">{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scheduled Report - Optional */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium">Schedule Report</h3>
        <p>(Coming soon)</p>
      </div>
    </div>
  )
}

export default ReportsExport
