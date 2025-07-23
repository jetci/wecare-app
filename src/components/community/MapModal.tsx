'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MapViewer, { MapViewerProps } from './MapViewer';

interface MapModalProps extends MapViewerProps {
  open: boolean;
  onClose: () => void;
}

export default function MapModal({ open, onClose, locations, center, zoom }: MapModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow"
        >
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        </button>
        <div className="absolute inset-0">
          {locations.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-gray-500">ยังไม่มีตำแหน่งให้แสดง</div>
          ) : (
            <MapViewer locations={locations} center={center} zoom={zoom} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
