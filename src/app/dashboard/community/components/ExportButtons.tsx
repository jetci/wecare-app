"use client";

import React from 'react';
import { exportCSV, exportPDF } from '@/lib/export';
import type { Ride } from '@/types/api';

interface ExportButtonsProps {
  rides: Ride[];
}

export default function ExportButtons({ rides }: ExportButtonsProps) {
  return (
    <div className="flex space-x-2 mt-4">
      <button
        data-testid="export-csv"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => exportCSV(rides)}
      >
        Export CSV
      </button>
      <button
        data-testid="export-pdf"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => exportPDF(rides)}
      >
        Export PDF
      </button>
    </div>
  );
}
