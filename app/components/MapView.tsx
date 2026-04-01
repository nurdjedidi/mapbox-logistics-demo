import { useEffect, useRef, useState } from "react";
import { MapView as MapViewBase, createMarkerElement, splitRouteAtProgress } from "@nur_djedd/mapbox-component";
import type { Map as MapboxMap } from "mapbox-gl";
import type { Dossier } from "~/types";

interface MapViewProps {
  dossiers: Dossier[];
  selectedId: string | null;
  onSelectDossier: (id: string) => void;
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

export default function MapView({ dossiers, selectedId, onSelectDossier }: MapViewProps) {
  const markersRef = useRef<Map<string, { element: HTMLElement; update: (selected: boolean) => void }>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMapInit = (map: MapboxMap) => {
    const addedPorts = new Set<string>();

    dossiers.forEach((dossier) => {
      const { completed, remaining } = splitRouteAtProgress(dossier.route, dossier.progress);

      map.addSource(`route-${dossier.id}`, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: completed }, properties: {} },
      });
      map.addLayer({
        id: `route-solid-${dossier.id}`,
        type: "line",
        source: `route-${dossier.id}`,
        paint: { "line-color": getRouteColor(dossier), "line-width": 2, "line-opacity": 0.8 },
      });

      map.addSource(`route-remain-${dossier.id}`, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: remaining }, properties: {} },
      });
      map.addLayer({
        id: `route-dashed-${dossier.id}`,
        type: "line",
        source: `route-remain-${dossier.id}`,
        paint: { "line-color": getRouteColor(dossier), "line-width": 1.5, "line-opacity": 0.35, "line-dasharray": [3, 3] },
      });

      const color = getMarkerColor(dossier);
      const { element, update } = createMarkerElement(color, {
        hasAlert: dossier.alertes.length > 0,
        onClick: () => onSelectDossier(dossier.id),
      });

      // Dynamically import Marker to add to map
      import("mapbox-gl").then(({ default: mapboxgl }) => {
        new mapboxgl.Marker({ element, anchor: "center" })
          .setLngLat([dossier.positionActuelle.lng, dossier.positionActuelle.lat])
          .addTo(map);
      });

      markersRef.current.set(dossier.id, { element, update });

      const destKey = `${dossier.destination.lng},${dossier.destination.lat}`;
      if (!addedPorts.has(destKey)) {
        addedPorts.add(destKey);
        const portEl = document.createElement("div");
        portEl.style.cssText = `
          width: 8px; height: 8px;
          background: #94a3b8;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.4);
        `;
        import("mapbox-gl").then(({ default: mapboxgl }) => {
          new mapboxgl.Marker({ element: portEl, anchor: "center" })
            .setLngLat([dossier.destination.lng, dossier.destination.lat])
            .addTo(map);
        });
      }
    });
  };

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
