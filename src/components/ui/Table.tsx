import React from 'react'

interface TableProps<T> {
  columns: { key: keyof T | string; label: string; render?: (value: any, row: T) => React.ReactNode }[]
  data: T[]
  className?: string
  rowTestIdKey?: keyof T | string
  rowTestIdPrefix?: string
}

export function Table<T>({ columns, data, className = '', rowTestIdKey, rowTestIdPrefix }: TableProps<T>) {
  if (!data.length) return <p className="text-gray-500">ไม่พบข้อมูล</p>
  return (
    <div className={`overflow-x-auto ${className}`}>  
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <thead className="bg-[#E3F2FD] dark:bg-gray-700">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-2 text-left font-medium text-gray-800 dark:text-gray-100">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const testId = rowTestIdPrefix && rowTestIdKey
              ? `${rowTestIdPrefix}-${String((row as any)[rowTestIdKey])}`
              : undefined;
            return (
              <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-600" data-testid={testId}>
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
