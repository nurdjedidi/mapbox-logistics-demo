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

// Default center/zoom — never changes after mount (avoids package re-init)
const INITIAL_CENTER: [number, number] = [-1, 39];
const INITIAL_ZOOM = 4.2;

function getMarkerColor(d: Dossier) {
  if (d.alertes.some((a) => a.severite === "haute")) return "#dc2626";
  if (d.alertes.some((a) => a.severite === "moyenne")) return "#d97706";
  if (d.statut === "dedouane" || d.statut === "livre") return "#059669";
  return "#3b82f6";
}

function getRouteColor(d: Dossier) {
  if (d.alertes.some((a) => a.severite === "haute")) return "#ef4444";
  if (d.alertes.some((a) => a.severite === "moyenne")) return "#f59e0b";
  if (d.statut === "dedouane") return "#10b981";
  return "#60a5fa";
}

export default function MapView({ dossiers, selectedId, onSelectDossier, center, zoom }: MapViewProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, { element: HTMLElement; update: (selected: boolean) => void }>>(new Map());
  const mapboxMarkersRef = useRef<Marker[]>([]);
  const layerIdsRef = useRef<string[]>([]);
  const sourceIdsRef = useRef<string[]>([]);
  // Keep latest values accessible inside stable callbacks
  const dossiersRef = useRef(dossiers);
  const onSelectRef = useRef(onSelectDossier);
  const [mapLoaded, setMapLoaded] = useState(false);

  dossiersRef.current = dossiers;
  onSelectRef.current = onSelectDossier;

  const clearMap = (map: MapboxMap) => {
    layerIdsRef.current.forEach((id) => {
      try { map.removeLayer(id); } catch { /* gone */ }
    });
    sourceIdsRef.current.forEach((id) => {
      try { map.removeSource(id); } catch { /* gone */ }
    });
    mapboxMarkersRef.current.forEach((m) => m.remove());
    layerIdsRef.current = [];
    sourceIdsRef.current = [];
    mapboxMarkersRef.current = [];
    markersRef.current.clear();
  };

  const populateMap = (map: MapboxMap, data: Dossier[]) => {
    const addedPorts = new Set<string>();

    data.forEach((dossier) => {
      const { completed, remaining } = splitRouteAtProgress(dossier.route, dossier.progress);
      const srcId = `route-${dossier.id}`;
      const srcRemId = `route-rem-${dossier.id}`;
      const layerSolid = `layer-solid-${dossier.id}`;
      const layerDashed = `layer-dashed-${dossier.id}`;

      map.addSource(srcId, { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: completed }, properties: {} } });
      map.addLayer({ id: layerSolid, type: "line", source: srcId, paint: { "line-color": getRouteColor(dossier), "line-width": 2, "line-opacity": 0.8 } });
      map.addSource(srcRemId, { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: remaining }, properties: {} } });
      map.addLayer({ id: layerDashed, type: "line", source: srcRemId, paint: { "line-color": getRouteColor(dossier), "line-width": 1.5, "line-opacity": 0.35, "line-dasharray": [3, 3] } });

      layerIdsRef.current.push(layerSolid, layerDashed);
      sourceIdsRef.current.push(srcId, srcRemId);

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

      const addPortMarker = (lng: number, lat: number) => {
        const key = `${lng},${lat}`;
        if (addedPorts.has(key)) return;
        addedPorts.add(key);
        const el = document.createElement("div");
        el.style.cssText = "width:8px;height:8px;background:#94a3b8;border-radius:50%;border:1.5px solid rgba(255,255,255,0.4);";
        import("mapbox-gl").then(({ default: mapboxgl }) => {
          const m = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map);
          mapboxMarkersRef.current.push(m);
        });
      };

      addPortMarker(dossier.destination.lng, dossier.destination.lat);
      addPortMarker(dossier.origine.lng, dossier.origine.lat);
    });
  };

  // Stable callback — never recreated, reads dossiers from ref
  const handleMapInit = useCallback((map: MapboxMap) => {
    mapRef.current = map;
    populateMap(map, dossiersRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — stable for the lifetime of the component

  // Stable callback
  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // When dossiers change (mode switch): clear + repopulate + flyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clearMap(map);
    populateMap(map, dossiers);
    if (center && zoom != null) {
      map.flyTo({ center, zoom, duration: 1600, essential: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossiers]);

  // selectedId highlight
  useEffect(() => {
    markersRef.current.forEach(({ update }, id) => update(id === selectedId));
  }, [selectedId]);

  if (!MAPBOX_TOKEN) return null;

  return (
    <div className="absolute inset-0">
      <MapViewBase
        accessToken={MAPBOX_TOKEN}
        className="w-full h-full"
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        onMapLoaded={handleMapLoaded}
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
