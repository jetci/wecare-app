'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PatientLocation } from '@/types/components';

interface CaseStatusMapProps {
  locations: PatientLocation[];
}

export function CaseStatusMap({ locations }: CaseStatusMapProps) {
  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} />
      ))}
    </MapContainer>
  );
}
