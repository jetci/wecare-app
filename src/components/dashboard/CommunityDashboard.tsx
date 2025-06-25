import React, { useState } from 'react'
import useSWR from 'swr'
import authFetcher from '@/lib/authFetcher'
import { NotificationList } from '../ui/NotificationList'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import RideForm from '../forms/RideForm'

const fetcher = authFetcher

interface Profile { name: string; role: string }
interface Ride { id: string; date: string; driver: string; status: string }
interface Notification { id: string; message: string; timestamp: string }

const CommunityDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const { data: profile, error: profileError } = useSWR<Profile>('/api/auth/profile', fetcher)
  const userId = profile?.name || ''

  const { data: rides, error: ridesError } = useSWR<Ride[]>(
    profile ? `/api/rides?userId=${userId}` : null,
    fetcher
  )
  const { data: notifications, error: notifError } = useSWR<Notification[]>('/api/notifications', fetcher)

  const lastRide = rides?.[0] || null

  if (profileError) return <p className="p-4 text-red-500">Error loading profile</p>

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {profile ? `Welcome, ${profile.name}` : 'Loading...'}
        </h1>
        <Button variant="secondary" size="md" onClick={() => (window.location.href = '/profile/edit')} aria-label="Edit Profile">
          แก้ไขโปรไฟล์
        </Button>
      </div>

      {/* Active Ride & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium mb-2">Latest Ride</h3>
          {lastRide ? (
            <div className="space-y-1">
              <p className="font-medium">Date: {lastRide.date}</p>
              <p className="text-sm">Driver: {lastRide.driver}</p>
              <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded">
                {lastRide.status}
              </span>
            </div>
          ) : (
            <p className="text-gray-500">No rides yet</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-medium mb-2">Notifications</h3>
          {notifError && <p className="text-red-500">Failed to load notifications</p>}
          {!notifications ? <p>Loading...</p> : <NotificationList items={notifications} />}
        </Card>
      </div>

      {/* New Ride Request */}
      <div className="text-center">
        <Button variant="primary" size="md" onClick={() => setShowForm(true)} aria-label="Request New Ride">
          Request New Ride
        </Button>
      </div>

      {/* Ride History */}
      <div>
        <h2 className="text-xl font-medium mb-2">Ride History</h2>
        {ridesError && <p className="text-red-500">Failed to load history</p>}
        {!rides ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Driver</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2">{r.driver}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">
                      <button className="text-blue-500 hover:underline">Rate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <RideForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

export default CommunityDashboard
