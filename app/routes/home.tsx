import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "~/components/Header";
import LeftPanel from "~/components/LeftPanel";
import RightPanel from "~/components/RightPanel";
import MapView from "~/components/MapView";
import { dossiers } from "~/data/dossiers";
import { useIsMobile } from "~/hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  useEffect(() => {
    document.body.classList.add("layout-map");
    return () => document.body.classList.remove("layout-map");
  }, []);

  // Close left panel by default on mobile
  useEffect(() => {
    if (isMobile) setLeftPanelOpen(false);
    else setLeftPanelOpen(true);
  }, [isMobile]);

  const selectedDossier = dossiers.find((d) => d.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (isMobile) setLeftPanelOpen(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      <MapView
        dossiers={dossiers}
        selectedId={selectedId}
        onSelectDossier={setSelectedId}
      />
      <Header
        dossiers={dossiers}
        panelOpen={leftPanelOpen}
        onTogglePanel={() => setLeftPanelOpen((v) => !v)}
      />
      <AnimatePresence>
        {isMobile && (leftPanelOpen || !!selectedDossier) && (
          <div
            key="backdrop"
            className="fixed inset-0 z-20 bg-black/50"
            onClick={() => { setLeftPanelOpen(false); setSelectedId(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {leftPanelOpen && (
          <LeftPanel
            key="left-panel"
            dossiers={dossiers}
            selectedId={selectedId}
            onSelect={handleSelect}
            onClose={() => setLeftPanelOpen(false)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedDossier && (
          <RightPanel
            key={selectedDossier.id}
            dossier={selectedDossier}
            onClose={() => setSelectedId(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
