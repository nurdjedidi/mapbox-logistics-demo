import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "~/components/Header";
import LeftPanel from "~/components/LeftPanel";
import RightPanel from "~/components/RightPanel";
import MapView from "~/components/MapView";
import { dossiers } from "~/data/dossiers";

export function meta() {
  return [
    { title: "TransitTrack — Dashboard" },
    { name: "description", content: "Suivi conteneurs et camions en temps réel" },
  ];
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css",
    },
  ];
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("layout-map");
    return () => document.body.classList.remove("layout-map");
  }, []);

  const selectedDossier = dossiers.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      <MapView
        dossiers={dossiers}
        selectedId={selectedId}
        onSelectDossier={setSelectedId}
      />
      <Header dossiers={dossiers} />
      <LeftPanel dossiers={dossiers} selectedId={selectedId} onSelect={setSelectedId} />
      <AnimatePresence>
        {selectedDossier && (
          <RightPanel
            key={selectedDossier.id}
            dossier={selectedDossier}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
