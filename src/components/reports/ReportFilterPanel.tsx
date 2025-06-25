import React, { useState } from 'react'

export interface ReportFilters {
  type: 'RIDE' | 'USER'
  from: string
  to: string
}

interface ReportFilterPanelProps {
  onFilter: (filters: ReportFilters) => void
}

export default function ReportFilterPanel({ onFilter }: ReportFilterPanelProps) {
  const [type, setType] = useState<ReportFilters['type']>('RIDE')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSearch = () => {
    setError('')
    if (from && to && from > to) {
      setError('วันที่เริ่มต้นต้องน้อยกว่าสิ้นสุด')
      return
    }
    onFilter({ type, from, to })
  }

  return (
    <div className="space-y-3 p-4 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium">Report Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as ReportFilters['type'])}
          className="mt-1 w-full border rounded px-2 py-1"
        >
          <option value="RIDE">รายงานการเดินทาง</option>
          <option value="USER">รายงานผู้ใช้</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="block text-sm font-medium">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSearch}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded"
      >
        ค้นหารายงาน
      </button>
    </div>
  )
}
