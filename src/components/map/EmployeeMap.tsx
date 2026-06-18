"use client";

import { useEffect, useRef } from "react";
import type { MapMarker } from "@/types";
import { getStatusConfig } from "@/utils/status";

let L: typeof import("leaflet") | null = null;

interface EmployeeMapProps {
  markers: MapMarker[];
  selectedId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

function createCustomIcon(leaflet: typeof import("leaflet"), markerColor: string, selected = false) {
  const s = selected ? 44 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 36 36"><circle cx="18" cy="18" r="12" fill="${markerColor}" opacity="0.2"/><circle cx="18" cy="18" r="8" fill="${markerColor}" stroke="white" stroke-width="2"/></svg>`;
  return leaflet.divIcon({ html: svg, className: "", iconSize: [s, s], iconAnchor: [s / 2, s / 2], popupAnchor: [0, -(s / 2)] });
}

export function EmployeeMap({ markers, selectedId, onMarkerClick }: EmployeeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterGroupRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;
    let cancelled = false;

    async function initMap() {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      if (cancelled || !mapRef.current) return;
      L = leaflet;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      const map = leaflet.map(mapRef.current!, { center: [51.505, -0.09], zoom: 5, zoomControl: false });
      leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors \u00a9 <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (leaflet as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconCreateFunction: (c: any) => {
          const count = c.getChildCount();
          return leaflet.divIcon({
            html: `<div style="background:rgba(59,130,246,0.85);border:2px solid rgba(147,197,253,0.6);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;backdrop-filter:blur(4px)">${count}</div>`,
            className: "", iconSize: [40, 40], iconAnchor: [20, 20],
          });
        },
      });
      map.addLayer(cluster);
      mapInstanceRef.current = map;
      clusterGroupRef.current = cluster;
    }

    initMap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current || !L) return;
    const leaflet = L;
    const cluster = clusterGroupRef.current;
    const currentIds = new Set(markers.map((m) => m.id));
    const existingIds = new Set(leafletMarkersRef.current.keys());
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        const m = leafletMarkersRef.current.get(id);
        if (m) cluster.removeLayer(m);
        leafletMarkersRef.current.delete(id);
      }
    }
    for (const markerData of markers) {
      const cfg = getStatusConfig(markerData.status);
      const isSelected = markerData.employeeId === selectedId;
      const icon = createCustomIcon(leaflet, cfg.markerColor, isSelected);
      const existing = leafletMarkersRef.current.get(markerData.id);
      if (existing) {
        existing.setLatLng([markerData.lat, markerData.lng]);
        existing.setIcon(icon);
      } else {
        const lm = leaflet.marker([markerData.lat, markerData.lng], { icon });
        lm.bindPopup(`<div style="font-family:system-ui;padding:4px"><div style="font-weight:600;font-size:14px;margin-bottom:4px">${markerData.employeeName}</div><div style="font-size:12px;color:#94a3b8">📍 ${markerData.address}</div></div>`, { maxWidth: 280 });
        lm.on("click", () => onMarkerClick?.(markerData));
        cluster.addLayer(lm);
        leafletMarkersRef.current.set(markerData.id, lm);
      }
    }
    if (markers.length > 0 && !selectedId) {
      const bounds = leaflet.latLngBounds(markers.map((m) => leaflet.latLng(m.lat, m.lng)));
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, selectedId, onMarkerClick]);

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const marker = markers.find((m) => m.employeeId === selectedId);
    if (marker) mapInstanceRef.current.flyTo([marker.lat, marker.lng], 15, { duration: 1.2 });
  }, [selectedId, markers]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <div ref={mapRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.06]" />
    </div>
  );
}
