import React, { useState } from 'react'
import useSWR from 'swr'
import { NotificationList } from '../ui/NotificationList'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import { CaseStatusMap } from '../maps/CaseStatusMap'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const HealthOfficerDashboard: React.FC = () => {
  const [confirm, setConfirm] = useState<{ patientId: string; action: 'approve' | 'transfer' } | null>(null)

  const { data: profile } = useSWR<{ id: string; role: string }>('/api/auth/profile', fetcher)
  const userId = profile?.id || ''

  const { data: assigned, mutate: mutateAssigned } = useSWR<any[]>(
    `/api/patients?assignedTo=${userId}`,
    fetcher
  )
  const { data: unapproved, mutate: mutateUnapproved } = useSWR<any[]>(
    '/api/patients?approved=false',
    fetcher
  )
  const { data: notifications } = useSWR('/api/notifications', fetcher)

  const handleApprove = async (patientId: string) => {
    await fetch(`/api/patients/${patientId}/approve`, { method: 'PATCH' })
    // revalidate
    mutateAssigned && mutateAssigned()
    mutateUnapproved()
    window.alert('อนุมัติสำเร็จ')
  }

  const handleTransfer = async (patientId: string) => {
    const to = window.prompt('กรุณาใส่ User ID ที่จะส่งต่อ')
    if (!to) return
    await fetch('/api/patients/transfer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, toUserId: to }),
    })
    mutateAssigned()
    window.alert('ส่งต่อสำเร็จ')
  }

  return (
    <div className="p-4 space-y-6">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="text-lg">รอตรวจ</h3>
          <p className="text-2xl font-bold">{unapproved?.length || 0}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="text-lg">อยู่ในการดูแล</h3>
          <p className="text-2xl font-bold">{assigned?.length || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-lg">เสร็จสิ้น</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-2">รายการผู้ป่วย</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">รออนุมัติ</h3>
            {unapproved?.map(p => (
              <div key={p.id} className="flex justify-between items-center border p-2 my-1">
                <span>{p.firstName} {p.lastName}</span>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleApprove(p.id)}
                >อนุมัติ</button>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium">อยู่ในการดูแล</h3>
            {assigned?.map(p => (
              <div key={p.id} className="flex justify-between items-center border p-2 my-1">
                <span>{p.firstName} {p.lastName}</span>
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => handleTransfer(p.id)}
                >ส่งต่อ</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Cluster */}
      <div className="h-64">
        <CaseStatusMap locations={assigned || []} />
      </div>

      {/* Notifications and Reports */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold">สถิติ/รายงาน</h2>
          {/* Placeholder for stats */}
          <p>Coming soon...</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">แจ้งเตือน</h2>
          {!notifications ? <p>Loading...</p> : <NotificationList items={notifications} />}
        </div>
      </div>

      {/* Confirmation Modal (if needed) */}
      {confirm && (
        <ConfirmationModal
          open={true}
          title="ยืนยันการทำรายการ"
          message={`คุณต้องการที่จะ${confirm.action === 'approve' ? 'อนุมัติ' : 'ส่งต่อ'} ผู้ป่วยหรือไม่?`}
          onConfirm={() => {
            if (confirm.action === 'approve') handleApprove(confirm.patientId)
            else handleTransfer(confirm.patientId)
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

export default HealthOfficerDashboard
