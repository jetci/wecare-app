import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

export interface MapProps {
  locations: Location[];
  onMarkerClick: (loc: Location) => void;
}

export default function CommunityMap({ locations, onMarkerClick }: MapProps) {
  const center = locations.length > 0 ? [locations[0].lat, locations[0].lng] as [number, number] : [0, 0];
  return (
    <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map(loc => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng] as [number, number]}
          eventHandlers={{ click: () => onMarkerClick(loc) }}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
