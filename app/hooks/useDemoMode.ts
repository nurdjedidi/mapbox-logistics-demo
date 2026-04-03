import { useState } from "react";
import { dossiers as medDossiers } from "~/data/dossiers";
import { dossiersComores } from "~/data/comores";
import { dossiersMalacca } from "~/data/malacca";
import type { Dossier } from "~/types";

export type DemoMode = "mediterranee" | "comores" | "malacca";

interface DemoModeState {
  mode: DemoMode;
  setMode: (m: DemoMode) => void;
  dossiers: Dossier[];
  mapCenter: [number, number];
  mapZoom: number;
}

const configs: Record<DemoMode, { dossiers: Dossier[]; center: [number, number]; zoom: number }> = {
  mediterranee: {
    dossiers: medDossiers,
    center: [-1, 39],
    zoom: 4.2,
  },
  comores: {
    dossiers: dossiersComores,
    center: [42, 8],
    zoom: 3.2,
  },
  malacca: {
    dossiers: dossiersMalacca,
    center: [110, 12],
    zoom: 3.6,
  },
};

export function useDemoMode(): DemoModeState {
  const [mode, setMode] = useState<DemoMode>("mediterranee");
  const config = configs[mode];
  return {
    mode,
    setMode,
    dossiers: config.dossiers,
    mapCenter: config.center,
    mapZoom: config.zoom,
  };
}
