import React from 'react'

export interface Notification {
  id: string
  message: string
  timestamp: string
}

interface NotificationListProps {
  items: Notification[]
}

export const NotificationList: React.FC<NotificationListProps> = ({ items }) => {
  if (!items.length) return <p className="text-gray-500 p-2">ไม่มีการแจ้งเตือน</p>
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.id} className="p-2 bg-white dark:bg-gray-700 rounded shadow-sm">
          <p className="text-sm text-gray-800 dark:text-gray-200">{item.message}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</span>
        </li>
      ))}
    </ul>
  )
}
