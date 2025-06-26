import React, { useState } from 'react'
import useSWR from 'swr'
import { User, LogEntry, ApiKey, ConfirmInfo, UnknownObject } from '@/types/components'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import { SummaryCard } from '../ui/SummaryCard'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(res => res.json())
const tabs = [
  'Users', 'Logs', 'Settings', 'API Keys', 'Maintenance', 'Thresholds'
]

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0])
  const [confirm, setConfirm] = useState<ConfirmInfo | null>(null)

  // Data
  const { data: users, error: usersError, mutate: mutateUsers } = useSWR<User[]>('/api/admin/users', fetcher)
  const { data: logs, error: logsError } = useSWR<LogEntry[]>('/api/admin/logs', fetcher)
  const { data: settings, error: settingsError } = useSWR('/api/admin/settings', fetcher)
  const { data: apiKeys, error: keysError, mutate: mutateKeys } = useSWR<ApiKey[]>('/api/admin/api-keys', fetcher)
  const { data: thresholds, error: thrError, mutate: mutateThr } = useSWR<UnknownObject[]>('/api/admin/settings/thresholds', fetcher)

  // Actions
  const handleAction = async (url: string, method='PUT', body?: UnknownObject, refresh?: () => void) => {
    try {
      const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: body && JSON.stringify(body) })
      if (!res.ok) throw new Error('Action failed')
      toast.success('สำเร็จ')
      refresh && refresh()
    } catch (err) {
      toast.error('ล้มเหลว')
    }
  }

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map(tab => (
          <button key={tab}
            className={`px-4 py-2 ${activeTab===tab ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>
      <div>
        {activeTab === 'Users' && (
          <div>
            {!users && <p>Loading users...</p>}
            {usersError && <p className="text-red-500">Error loading users</p>}
            {users?.map((u: User) => (
              <div key={u.id} className="flex justify-between p-2 border-b">
                <span>{u.firstName} {u.lastName} ({u.role})</span>
                <div className="space-x-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded"
                    onClick={() => handleAction(`/api/admin/users/${u.id}/approve`, 'PUT', undefined, mutateUsers)}>
                    Approve
                  </button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleAction(`/api/admin/users/${u.id}/disable`, 'PUT', undefined, mutateUsers)}>
                    Disable
                  </button>
                  <button className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => handleAction(`/api/admin/users/${u.id}/reset-password`, 'POST')}>
                    Reset PW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Logs' && (
          <div>
            {!logs && <p>Loading logs...</p>}
            {logsError && <p className="text-red-500">Error loading logs</p>}
            <div className="max-h-64 overflow-auto">
              {logs?.map((log: LogEntry, i: number) => (
                <div key={i} className="text-sm border-b p-1">
                  [{log.timestamp}] {log.user} {log.action} from {log.ip}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'Settings' && (
          <div>
            {/* System Settings form */}
            {!settings && <p>Loading settings...</p>}
            {settings && <pre>{JSON.stringify(settings,null,2)}</pre>}
          </div>
        )}
        {activeTab === 'API Keys' && (
          <div>
            <button className="mb-2 px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => handleAction('/api/admin/api-keys','POST',undefined, mutateKeys)}>
              Create Key
            </button>
            {keysError && <p className="text-red-500">Error</p>}
            {apiKeys?.map((k: ApiKey) => (
              <div key={k.id} className="flex justify-between p-1 border-b">
                <span>{k.key}</span>
                <button className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleAction(`/api/admin/api-keys/${k.id}`,'DELETE',undefined, mutateKeys)}>
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Maintenance' && (
          <div className="space-y-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => handleAction('/api/admin/backup','POST')}>Backup Data</button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded"
              onClick={() => handleAction('/api/admin/cache/clear','POST')}>Clear Cache</button>
          </div>
        )}
        {activeTab === 'Thresholds' && (
          <div>
            {!thresholds && <p>Loading...</p>}
            {thresholds && <pre>{JSON.stringify(thresholds,null,2)}</pre>}
          </div>
        )}
      </div>
      {confirm && (
        <ConfirmationModal
          open
          title="Confirm Action"
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

export default AdminDashboard
