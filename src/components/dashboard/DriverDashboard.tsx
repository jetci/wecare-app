import React, { useState } from 'react'
import useSWR from 'swr'
import { NotificationList, Notification } from '../ui/NotificationList'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import { DriverLiveMap } from '../maps/DriverLiveMap'
import { RideRequest, UnknownObject } from '@/types/components'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const DriverDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [actionRide, setActionRide] = useState<{ id: string; action: string } | null>(null)

  const { data: profile } = useSWR<{ id: string; role: string }>('/api/auth/profile', fetcher)
  const userId = profile?.id || ''

  const { data: pending, mutate: mutatePending } = useSWR<RideRequest[]>(
    isOnline ? `/api/rides?driverId=${userId}&status=PENDING` : null,
    fetcher
  )
  const { data: inProgress, mutate: mutateInProgress } = useSWR<RideRequest[]>(
    isOnline ? `/api/rides?driverId=${userId}&status=IN_PROGRESS` : null,
    fetcher
  )

  const { data: history } = useSWR<RideRequest[]>(
    `/api/rides?driverId=${userId}&status=COMPLETED`,
    fetcher
  )
  const { data: notifications } = useSWR<Notification[]>('/api/notifications', fetcher)

  const toggleOnline = () => setIsOnline(o => !o)

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/rides/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    // revalidate lists
    mutatePending && mutatePending()
    mutateInProgress && mutateInProgress()
  }

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={toggleOnline}
        className={`px-4 py-2 rounded ${isOnline ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {isOnline ? 'Go Offline' : 'Go Online'}
      </button>

      {isOnline && (
        <section>
          <h2 className="text-xl font-semibold">New Requests</h2>
          {pending?.length === 0 && <p>ไม่มีคำขอใหม่</p>}
          {pending?.map((r: RideRequest) => (
            <div key={r.id} className="border p-2 my-2 flex justify-between items-center">
              <div>
                <p>Patient: {r.patient.firstName} {r.patient.lastName}</p>
                <p>Date: {new Date(r.date).toLocaleString()}</p>
              </div>
              <div className="space-x-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => updateStatus(r.id, 'ACCEPTED')}
                >รับ</button>
                <button
                  className="px-2 py-1 bg-gray-400 text-white rounded"
                  onClick={() => updateStatus(r.id, 'CANCELLED')}
                >ปฏิเสธ</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {inProgress && inProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Current Ride</h2>
          {inProgress.map((r: RideRequest) => (
            <div key={r.id} className="space-y-4">
              <DriverLiveMap rideId={r.id} />
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                  onClick={() => updateStatus(r.id, 'PENDING')}
                >มาถึงแล้ว</button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => updateStatus(r.id, 'COMPLETED')}
                >เสร็จสิ้น</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">History</h2>
        {history?.length === 0 && <p>ยังไม่มีประวัติ</p>}
        <ul>
          {history?.map((r: RideRequest) => (
            <li key={r.id} className="border-b py-2">
              {new Date(r.date).toLocaleString()} - {r.patient.firstName} {r.patient.lastName}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Notifications</h2>
        {!notifications ? <p>Loading…</p> : <NotificationList items={notifications} />}
      </section>
    </div>
  )
}

export default DriverDashboard
