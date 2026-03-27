'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Incident {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface IncidentMapProps {
  incidents: Incident[];
}

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Initialize map centered on South Africa
      const map = L.map(mapRef.current).setView([-29.0, 25.0], 5);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Helper to get marker color by status
      const getMarkerColor = (status: string): string => {
        switch (status) {
          case 'pending': return 'orange';
          case 'investigating':
          case 'verified': return 'blue';
          case 'resolved': return 'green';
          case 'dismissed': return 'gray';
          default: return 'orange';
        }
      };

      // Create colored icon
      const createColoredIcon = (color: string) => {
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
            <path fill="${color}" stroke="white" stroke-width="1.5" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"/>
            <circle fill="white" cx="12.5" cy="12.5" r="5"/>
          </svg>
        `;
        return L.divIcon({
          html: svgIcon,
          className: '',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      };

      // Add markers for incidents with coordinates
      incidents.forEach((incident) => {
        if (
          incident.latitude != null &&
          incident.longitude != null &&
          !isNaN(incident.latitude) &&
          !isNaN(incident.longitude)
        ) {
          const color = getMarkerColor(incident.status);
          const icon = createColoredIcon(color);
          const marker = L.marker([incident.latitude, incident.longitude], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="min-width:180px">
              <strong style="font-size:14px">${incident.title}</strong><br/>
              <span style="color:#6b7280;font-size:12px">Category: ${incident.category.replace(/_/g, ' ')}</span><br/>
              <span style="color:#6b7280;font-size:12px">Location: ${incident.location}</span><br/>
              <span style="font-size:12px">Status: <strong>${incident.status}</strong></span>
            </div>
          `);
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when incidents change (after initial mount)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const getMarkerColor = (status: string): string => {
        switch (status) {
          case 'pending': return 'orange';
          case 'investigating':
          case 'verified': return 'blue';
          case 'resolved': return 'green';
          case 'dismissed': return 'gray';
          default: return 'orange';
        }
      };

      const createColoredIcon = (color: string) => {
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
            <path fill="${color}" stroke="white" stroke-width="1.5" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"/>
            <circle fill="white" cx="12.5" cy="12.5" r="5"/>
          </svg>
        `;
        return L.divIcon({
          html: svgIcon,
          className: '',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      };

      incidents.forEach((incident) => {
        if (
          incident.latitude != null &&
          incident.longitude != null &&
          !isNaN(incident.latitude) &&
          !isNaN(incident.longitude)
        ) {
          const color = getMarkerColor(incident.status);
          const icon = createColoredIcon(color);
          const marker = L.marker([incident.latitude, incident.longitude], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="min-width:180px">
              <strong style="font-size:14px">${incident.title}</strong><br/>
              <span style="color:#6b7280;font-size:12px">Category: ${incident.category.replace(/_/g, ' ')}</span><br/>
              <span style="color:#6b7280;font-size:12px">Location: ${incident.location}</span><br/>
              <span style="font-size:12px">Status: <strong>${incident.status}</strong></span>
            </div>
          `);
        }
      });
    });
  }, [incidents]);

  return (
    <div>
      <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} />
      <div className="flex gap-4 mt-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span> Investigating/Verified
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Resolved
        </span>
      </div>
    </div>
  );
}
