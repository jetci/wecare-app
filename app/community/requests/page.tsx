"use client";
import React, { useState } from "react";
import { useCommunityRequests } from "@/hooks/useCommunityRequests";

const PAGE_SIZE = 10;

export default function CommunityRequestsPage() {
  const [filters, setFilters] = useState({
    nationalId: "",
    type: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const { data, loading, error } = useCommunityRequests({
    ...filters,
    page,
    limit: PAGE_SIZE,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Requests</h1>
      <div className="flex gap-4 mb-4">
        <input
          name="nationalId"
          placeholder="ค้นหารหัสประชาชน"
          value={filters.nationalId}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-48"
        />
        <input
          name="type"
          placeholder="ค้นหาประเภทคำร้อง"
          value={filters.type}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-32"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-32"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="approved">อนุมัติ</option>
          <option value="rejected">ปฏิเสธ</option>
        </select>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse h-8 bg-gray-200 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">รหัสประชาชน</th>
                <th className="p-2 border">ประเภท</th>
                <th className="p-2 border">รายละเอียด</th>
                <th className="p-2 border">สถานะ</th>
                <th className="p-2 border">วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row: any, idx: number) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="p-2 border">{row.nationalId}</td>
                    <td className="p-2 border">{row.type}</td>
                    <td className="p-2 border">{row.details}</td>
                    <td className="p-2 border">{row.status}</td>
                    <td className="p-2 border">{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center">
            <button
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>หน้า {page}</span>
            <button
              className="px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || data.length < PAGE_SIZE}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
