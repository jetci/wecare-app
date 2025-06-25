import React from 'react';

interface Ride {
  id: string;
  date: string;
  status: string;
  driverName?: string;
  rating?: number;
}

interface RideTableProps {
  rides: Ride[];
}

export default function RideTable({ rides }: RideTableProps) {
  return (
    <table data-testid="ride-table" aria-label="Ride Table" className="w-full text-left">
      <thead>
        <tr>
          <th className="p-2">Date</th>
          <th className="p-2">Status</th>
          <th className="p-2">Driver</th>
          <th className="p-2">Rating</th>
        </tr>
      </thead>
      <tbody>
        {rides.map(r => (
          <tr key={r.id} className="border-t" data-testid={`ride-row-${r.id}`}>
            <td className="p-2">{r.date}</td>
            <td className="p-2">{r.status}</td>
            <td className="p-2">{r.driverName || '-'}</td>
            <td className="p-2">{r.rating ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
