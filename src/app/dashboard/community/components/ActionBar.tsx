"use client";
import React from 'react';

type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface ActionBarProps {
  searchText: string;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: StatusFilter) => void;
  onNewRequest: () => void;
}

export default function ActionBar({
  searchText,
  statusFilter,
  onSearchChange,
  onFilterChange,
  onNewRequest
}: ActionBarProps) {
  const filters: { label: string; value: StatusFilter; testId: string }[] = [
    { label: 'All', value: 'ALL', testId: 'filter-all' },
    { label: 'Pending', value: 'PENDING', testId: 'filter-pending' },
    { label: 'In-Progress', value: 'IN_PROGRESS', testId: 'filter-in-progress' },
    { label: 'Completed', value: 'COMPLETED', testId: 'filter-completed' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
      <button
        data-testid="new-request-btn"
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={onNewRequest}
      >
        New Request
      </button>
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search..."
        className="border p-2 rounded flex-grow mx-2"
        value={searchText}
        onChange={e => onSearchChange(e.target.value)}
      />
      <div className="flex space-x-2">
        {filters.map(f => (
          <button
            key={f.value}
            data-testid={f.testId}
            className={`px-3 py-1 rounded ${statusFilter === f.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
