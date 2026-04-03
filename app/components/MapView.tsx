import { useEffect, useRef, useState, useCallback } from "react";
import { MapView as MapViewBase, createMarkerElement, splitRouteAtProgress } from "@nur_djedd/mapbox-component";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import type { Dossier } from "~/types";

interface MapViewProps {
  dossiers: Dossier[];
  selectedId: string | null;
  onSelectDossier: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

function getMarkerColor(dossier: Dossier): string {
  if (dossier.alertes.some((a) => a.severite === "haute")) return "#dc2626";
  if (dossier.alertes.some((a) => a.severite === "moyenne")) return "#d97706";
  if (dossier.statut === "dedouane" || dossier.statut === "livre") return "#059669";
  return "#3b82f6";
}

function getRouteColor(dossier: Dossier): string {
  if (dossier.alertes.some((a) => a.severite === "haute")) return "#ef4444";
  if (dossier.alertes.some((a) => a.severite === "moyenne")) return "#f59e0b";
  if (dossier.statut === "dedouane") return "#10b981";
  return "#60a5fa";
}

export default function MapView({ dossiers, selectedId, onSelectDossier, center, zoom }: MapViewProps) {
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, { element: HTMLElement; update: (selected: boolean) => void }>>(new Map());
  const mapboxMarkersRef = useRef<Marker[]>([]);
  const layerIdsRef = useRef<string[]>([]);
  const sourceIdsRef = useRef<string[]>([]);
  const onSelectRef = useRef(onSelectDossier);
  const [mapLoaded, setMapLoaded] = useState(false);

  onSelectRef.current = onSelectDossier;

  const populateMap = useCallback((map: MapboxMap, data: Dossier[]) => {
    const addedPorts = new Set<string>();

    data.forEach((dossier) => {
      const { completed, remaining } = splitRouteAtProgress(dossier.route, dossier.progress);

      const srcId = `route-${dossier.id}`;
      const srcRemId = `route-remain-${dossier.id}`;
      const layerSolid = `route-solid-${dossier.id}`;
      const layerDashed = `route-dashed-${dossier.id}`;

      map.addSource(srcId, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: completed }, properties: {} },
      });
      map.addLayer({
        id: layerSolid,
        type: "line",
        source: srcId,
        paint: { "line-color": getRouteColor(dossier), "line-width": 2, "line-opacity": 0.8 },
      });

      map.addSource(srcRemId, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: remaining }, properties: {} },
      });
      map.addLayer({
        id: layerDashed,
        type: "line",
        source: srcRemId,
        paint: { "line-color": getRouteColor(dossier), "line-width": 1.5, "line-opacity": 0.35, "line-dasharray": [3, 3] },
      });

      sourceIdsRef.current.push(srcId, srcRemId);
      layerIdsRef.current.push(layerSolid, layerDashed);

      const color = getMarkerColor(dossier);
      const { element, update } = createMarkerElement(color, {
        hasAlert: dossier.alertes.length > 0,
        onClick: () => onSelectRef.current(dossier.id),
      });

      import("mapbox-gl").then(({ default: mapboxgl }) => {
        const m = new mapboxgl.Marker({ element, anchor: "center" })
          .setLngLat([dossier.positionActuelle.lng, dossier.positionActuelle.lat])
          .addTo(map);
        mapboxMarkersRef.current.push(m);
      });

      markersRef.current.set(dossier.id, { element, update });

      const addPort = (lng: number, lat: number) => {
        const key = `${lng},${lat}`;
        if (addedPorts.has(key)) return;
        addedPorts.add(key);
        const portEl = document.createElement("div");
        portEl.style.cssText = `
          width: 8px; height: 8px;
          background: #94a3b8;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.4);
        `;
        import("mapbox-gl").then(({ default: mapboxgl }) => {
          const m = new mapboxgl.Marker({ element: portEl, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
          mapboxMarkersRef.current.push(m);
        });
      };

      addPort(dossier.destination.lng, dossier.destination.lat);
      addPort(dossier.origine.lng, dossier.origine.lat);
    });
  }, []);

  const clearMap = useCallback((map: MapboxMap) => {
    try {
      layerIdsRef.current.forEach((id) => {
        try { map.removeLayer(id); } catch { /* already removed */ }
      });
      sourceIdsRef.current.forEach((id) => {
        try { map.removeSource(id); } catch { /* already removed */ }
      });
    } catch { /* style not loaded yet */ }
    mapboxMarkersRef.current.forEach((m) => m.remove());
    layerIdsRef.current = [];
    sourceIdsRef.current = [];
    mapboxMarkersRef.current = [];
    markersRef.current.clear();
  }, []);

  const initializedRef = useRef(false);

  const handleMapInit = useCallback((map: MapboxMap) => {
    mapInstanceRef.current = map;
    populateMap(map, dossiers);
    initializedRef.current = true;
  }, [dossiers, populateMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !initializedRef.current) return;
    clearMap(map);
    populateMap(map, dossiers);
    if (center && zoom != null) {
      map.flyTo({ center, zoom, duration: 1800, essential: true });
    }
  }, [dossiers, center, zoom, clearMap, populateMap]);

  useEffect(() => {
    markersRef.current.forEach(({ update }, id) => {
      update(id === selectedId);
    });
  }, [selectedId]);

  if (!MAPBOX_TOKEN) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      <MapViewBase
        accessToken={MAPBOX_TOKEN}
        className="w-full h-full"
        center={center}
        zoom={zoom}
        onMapLoaded={() => setMapLoaded(true)}
        onMapInit={handleMapInit}
      />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
            <p className="text-slate-500 text-xs font-mono tracking-wider">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
