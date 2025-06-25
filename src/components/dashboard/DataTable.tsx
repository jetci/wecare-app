import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortKey?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearch: (value: string) => void;
  statusFilter: string;
  onFilter: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
  filterOptions: string[];
}

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  search,
  onSearch,
  statusFilter,
  onFilter,
  sortOrder,
  toggleSortOrder,
  filterOptions,
}: DataTableProps<T>) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <input
          data-testid="search-input"
          type="text"
          value={search}
          placeholder="Search..."
          onChange={e => onSearch(e.target.value)}
          className="border p-1 rounded"
        />
        <select
          data-testid="filter-select"
          value={statusFilter}
          onChange={e => onFilter(e.target.value)}
          className="border p-1 rounded"
        >
          {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {columns.map(col => col.sortKey && (
          <button
            key={col.header}
            data-testid="sort-button"
            onClick={toggleSortOrder}
            className="border p-1 rounded"
          >
            Sort {col.header} {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        ))}
      </div>
      {loading && <p data-testid="table-loading">Loading...</p>}
      {error && <p data-testid="table-error" className="text-red-500">Error loading data</p>}
      {!loading && !error && (
        <table data-testid="data-table" className="min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map(col => <th key={col.header} className="border p-2 text-left">{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map(col => <td key={col.header} className="p-2">{col.accessor(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex items-center space-x-2 mt-4">
        <button
          data-testid="prev-page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border p-1 rounded disabled:opacity-50"
        >Prev</button>
        <span data-testid="page-info">Page {page} of {totalPages}</span>
        <button
          data-testid="next-page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border p-1 rounded disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  );
}
