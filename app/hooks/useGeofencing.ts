import { useState, useEffect, useRef } from "react";
import type { Dossier } from "~/types";

export interface GeofenceAlert {
  id: string;
  dossierId: string;
  portNom: string;
  distanceKm: number;
  hasDocIssue: boolean;
}

const THRESHOLD_KM = 450;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGeofencing(dossiers: Dossier[]) {
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const dismissedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dismissedRef.current.clear();
    setAlerts([]);

    const compute = () => {
      const triggered: GeofenceAlert[] = dossiers
        .filter((d) => d.statut === "en_transit")
        .map((d) => {
          const dist = haversineKm(
            d.positionActuelle.lat,
            d.positionActuelle.lng,
            d.destination.lat,
            d.destination.lng
          );
          return { dossier: d, dist };
        })
        .filter(({ dist }) => dist <= THRESHOLD_KM)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4)
        .map(({ dossier, dist }) => ({
          id: `geo-${dossier.id}`,
          dossierId: dossier.id,
          portNom: dossier.destination.nom,
          distanceKm: Math.round(dist),
          hasDocIssue: dossier.documents.some((doc) => doc.statut !== "recu"),
        }));

      setAlerts(triggered.filter((a) => !dismissedRef.current.has(a.id)));
    };

    // Small delay so map loads before alerts appear
    timerRef.current = setTimeout(compute, 1800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dossiers]);

  const dismiss = (id: string) => {
    dismissedRef.current.add(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return { alerts, dismiss };
}
