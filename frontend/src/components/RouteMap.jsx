import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export function RouteMap({ pickup, destination, waypoints = [], distance, estimatedTime }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  const pickupLat = pickup ? (pickup.lat || 17.4156) : 17.4156;
  const pickupLng = pickup ? (pickup.lng || 78.4350) : 78.4350;
  const destLat = destination ? (destination.lat || 17.4319) : 17.4319;
  const destLng = destination ? (destination.lng || 78.4073) : 78.4073;

  useEffect(() => {
    // Dynamically load leaflet if available
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapRef.current) return;

      try {
        const L = await import('leaflet');
        if (!isMounted || !mapRef.current) return;

        // Clean up previous instance
        if (leafletInstance.current) {
          leafletInstance.current.remove();
          leafletInstance.current = null;
        }

        const centerLat = (pickupLat + destLat) / 2;
        const centerLng = (pickupLng + destLng) / 2;

        const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
        leafletInstance.current = map;

        // OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Marker icons
        const pickupIcon = L.divIcon({
          className: 'custom-map-icon',
          html: '<div style="background:#10b981;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const destIcon = L.divIcon({
          className: 'custom-map-icon',
          html: '<div style="background:#0284c7;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🏢</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        // Add Markers
        L.marker([pickupLat, pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup:</b> ${pickup?.label || 'Restaurant'}`)
          .openPopup();

        L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination:</b> ${destination?.label || 'NGO Facility'}`);

        // Draw Polyline
        let points = [[pickupLat, pickupLng]];
        if (waypoints && waypoints.length > 0) {
          points = waypoints;
        } else {
          points.push([destLat, destLng]);
        }

        L.polyline(points, {
          color: '#10b981',
          weight: 5,
          opacity: 0.8,
          dashArray: '8, 8'
        }).addTo(map);

        const bounds = L.latLngBounds([pickupLat, pickupLng], [destLat, destLng]);
        map.fitBounds(bounds, { padding: [40, 40] });

      } catch (err) {
        console.warn("Leaflet rendering note:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [pickupLat, pickupLng, destLat, destLng, waypoints]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {/* Route Header Banner */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(6px)',
        padding: '10px 16px',
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Navigation size={18} color="#059669" />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
            {distance ? `${distance} km transit` : 'Smart Route Routing'}
          </span>
        </div>
        {estimatedTime && (
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '3px 8px',
            borderRadius: 6
          }}>
            ETA: {estimatedTime}
          </span>
        )}
      </div>

      <div
        ref={mapRef}
        style={{
          height: '380px',
          width: '100%',
          backgroundColor: '#f1f5f9'
        }}
      />
    </div>
  );
}
