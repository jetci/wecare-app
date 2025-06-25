"use client";
import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

export interface MapOverviewProps {
  locations: { id: string; lat: number; lng: number; }[];
}

function MapOverview({ locations }: MapOverviewProps) {
  const center = locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : { lat: 0, lng: 0 };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is missing');
    return (
      <p
        role="alert"
        aria-label="ไม่สามารถโหลดแผนที่"
        data-testid="map-error"
        className="h-64 w-full bg-gray-100 flex items-center justify-center"
      >
        ไม่สามารถโหลดแผนที่
      </p>
    );
  }
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey });
  if (loadError) {
    console.error('Error loading Google Maps script', loadError);
    return (
      <p
        role="alert"
        aria-label="ไม่สามารถโหลดแผนที่"
        data-testid="map-error"
        className="h-64 w-full bg-gray-100 flex items-center justify-center"
      >
        ไม่สามารถโหลดแผนที่
      </p>
    );
  }
  if (!isLoaded) {
    return <div className="h-64 w-full bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }
  return (
    <div className="h-64 w-full">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={12}
        onLoad={() => console.log('GoogleMap loaded')}
      >
        {locations.map((loc) => (
          <Marker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} />
        ))}
      </GoogleMap>
    </div>
  );
}

export default MapOverview;
