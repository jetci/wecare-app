"use client"
import React, { useState } from 'react'
import DashboardLayout from '../../layout'
import ReportFilterPanel, { ReportFilters } from '@/components/reports/ReportFilterPanel'
import useSWR from 'swr'
import { Spinner } from '@/components/ui/Spinner'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import * as Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

// Load reports with loading/error state
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({ type: 'RIDE', from: '', to: '' })
  const query = filters.from && filters.to
    ? `/api/reports?type=${filters.type}&from=${filters.from}&to=${filters.to}`
    : null
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Record<string, unknown>[] }>(query, fetcher)

  const handleExportCSV = () => {
    if (!data?.data) return
    const csv = Papa.unparse(data.data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filters.type}_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleExportPDF = () => {
    if (!data?.data) return
    const doc = new jsPDF()
    doc.text(`Report: ${filters.type}`, 14, 20)
    const cols = Object.keys(data.data[0] || {})
    const rows = data.data.map((row: Record<string, unknown>) =>
      cols.map(c => (row[c] !== undefined ? String(row[c]) : ''))
    )
    // @ts-ignore
    doc.autoTable({ head: [cols], body: rows, startY: 30 })
    doc.save(`${filters.type}_${Date.now()}.pdf`)
  }

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6 p-4">
          <ReportFilterPanel onFilter={setFilters} />
          {isLoading && <Spinner />}
          {error && <p className="text-red-500">Error loading report</p>}
          {data?.data && data.data.length > 0 ? (
            <>
              <Table
                columns={Object.keys(data.data[0]).map(key => ({ key, label: key }))}
                data={data.data}
              />
              <div className="flex space-x-2 mt-2">
                <Button onClick={handleExportCSV}>Export CSV</Button>
                <Button onClick={handleExportPDF}>Export PDF</Button>
              </div>
            </>
          ) : (
            !isLoading && <p>No data available</p>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
