import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapWidget({ locations, isExpanded }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !locations || locations.length === 0) return;

    const centerLoc = locations[locations.length - 1];

    if (!mapRef.current) {
      // Initialize map once
      mapRef.current = L.map(containerRef.current).setView([centerLoc.lat, centerLoc.lng], 3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      }).addTo(mapRef.current);
    } else {
      // Update center dynamically
      mapRef.current.setView([centerLoc.lat, centerLoc.lng], 3);
      // Remove old markers to redraw
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
           mapRef.current.removeLayer(layer);
        }
      });
    }

    // Add new markers
    locations.forEach((loc) => {
        L.marker([loc.lat, loc.lng])
         .addTo(mapRef.current)
         .bindPopup(loc.name);
    });

  }, [locations]);

  if (!locations || locations.length === 0) return null;

  return (
    <div className={`glass-panel rounded-xl p-3 sm:p-4 flex flex-col ${isExpanded ? 'h-full w-full border-none shadow-none' : 'h-[180px] sm:h-[250px]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ubicaciones</h3>
      </div>
      <div 
        ref={containerRef} 
        className="flex-1 rounded-lg overflow-hidden border border-white/20 dark:border-white/10 z-0 relative isolate"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
