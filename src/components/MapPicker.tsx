import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// default Leaflet marker icon
const markerIcon = new L.Icon.Default();

interface MapPickerProps {
  center: { lat: number; lng: number };
  onDragEnd: (position: { lat: number; lng: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ center, onDragEnd }) => {
  const mapRef = useRef<L.Map>(null);
  return (
    <MapContainer
      defaultCenter={center}
      zoom={13}
      whenCreated={(map) => {
        mapRef.current = map;
      }}
      className="w-full h-full"
    >
      <TileLayer
        url={`https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
      />
      <Marker
        icon={markerIcon}
        draggable
        position={[center.lat, center.lng]}
        eventHandlers={{
          dragend: (e: any) => {
            const coords = e.target.getLatLng();
            onDragEnd(coords);
            mapRef.current?.setView(coords);
          },
        }}
      >
        <Popup>ลากเพื่อกำหนดตำแหน่ง</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapPicker;
