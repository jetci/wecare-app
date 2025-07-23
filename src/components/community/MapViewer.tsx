'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export interface MapViewerProps {
  locations: { lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapViewer({ locations, center, zoom }: MapViewerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    // Use JS API loader to load Google Maps
    googleMapsApiKey: apiKey ?? '',
  });
  // Debug logs
  console.log('MapViewer Debug Locations:', locations);
  // Fallback when no locations provided
  if (!locations || locations.length === 0) {
    return <div className="p-4 text-yellow-500">No locations provided.</div>;
  }
  console.log('MapViewer Debug:', { apiKey, isLoaded, loadError });

  if (!apiKey) {
    return <div className="p-4 text-red-500">Missing Google Maps API key</div>;
  }
  if (loadError) {
    return <div className="p-4 text-red-500">Error loading Google Maps API</div>;
  }
  if (!isLoaded) {
    return <div className="p-4">Loading map...</div>;
  }

  const mapCenter = center ?? locations[0] ?? { lat: 0, lng: 0 };
  const mapZoom = zoom ?? (locations.length > 1 ? 10 : 14);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={mapZoom}
    >
      {locations.map((loc, idx) => (
        <Marker key={idx} position={loc} />
      ))}
    </GoogleMap>
  );
}
