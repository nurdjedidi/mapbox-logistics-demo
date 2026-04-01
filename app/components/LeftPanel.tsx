import { motion } from "framer-motion";
import { Ship, AlertCircle } from "lucide-react";
import type { Dossier } from "~/types";

interface LeftPanelProps {
  dossiers: Dossier[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatETA(eta: string): string {
  return new Date(eta).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statutStyles: Record<Dossier["statut"], string> = {
  en_transit: "text-blue-400",
  au_port: "text-amber-400",
  dedouane: "text-emerald-400",
  livre: "text-emerald-500",
};

const statutLabels: Record<Dossier["statut"], string> = {
  en_transit: "En transit",
  au_port: "Au port",
  dedouane: "Dédouané",
  livre: "Livré",
};

const glassPanel = {
  background: "linear-gradient(180deg, rgba(8,16,36,0.88) 0%, rgba(4,10,24,0.92) 100%)",
  backdropFilter: "blur(20px) saturate(180%)",
  borderRight: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "4px 0 32px rgba(0,0,0,0.5)",
};

export default function LeftPanel({ dossiers, selectedId, onSelect }: LeftPanelProps) {
  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="absolute top-14 left-0 bottom-0 w-72 z-10 flex flex-col"
      style={glassPanel}
    >
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-slate-200 font-semibold text-xs uppercase tracking-widest">Dossiers actifs</h2>
        <p className="text-slate-600 text-xs mt-0.5">
          {dossiers.length} dossiers · {dossiers.reduce((s, d) => s + d.alertes.length, 0)} alertes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {dossiers.map((dossier) => {
          const missing = dossier.documents.filter((d) => d.statut === "manquant").length;
          const pending = dossier.documents.filter((d) => d.statut === "en_attente").length;
          const hasHighAlert = dossier.alertes.some((a) => a.severite === "haute");
          const hasMedAlert = dossier.alertes.some((a) => a.severite === "moyenne");
          const isSelected = dossier.id === selectedId;

          return (
            <button
              key={dossier.id}
              onClick={() => onSelect(dossier.id)}
              className="w-full text-left px-4 py-3 transition-all cursor-pointer relative"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: isSelected
                  ? "linear-gradient(90deg, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.06) 100%)"
                  : undefined,
                borderLeft: isSelected ? "2px solid rgba(59,130,246,0.8)" : "2px solid transparent",
              }}
            >
              {!isSelected && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.03)" }} />
              )}

              <div className="flex items-start justify-between gap-2 relative">
                <div className="flex items-center gap-2 min-w-0">
                  <Ship className={`w-3 h-3 shrink-0 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                  <span className={`font-mono text-xs font-semibold truncate ${isSelected ? "text-blue-200" : "text-slate-300"}`}>
                    {dossier.id}
                  </span>
                </div>
                {(hasHighAlert || hasMedAlert) && (
                  <AlertCircle className={`shrink-0 w-3 h-3 mt-0.5 ${hasHighAlert ? "text-red-500" : "text-amber-500"}`} />
                )}
              </div>

              <p className="text-slate-500 text-xs mt-1 truncate relative">
                {dossier.origine.nom} <span className="text-slate-700">→</span> {dossier.destination.nom}
              </p>

              <div className="flex items-center justify-between mt-1.5 relative">
                <span className="text-slate-600 text-xs">ETA {formatETA(dossier.eta)}</span>
                <span className={`text-xs ${statutStyles[dossier.statut]}`}>{statutLabels[dossier.statut]}</span>
              </div>

              {(missing > 0 || pending > 0) && (
                <div className="flex items-center gap-2 mt-1.5 relative">
                  {missing > 0 && (
                    <span className="text-xs text-red-400/80 font-medium">
                      {missing} manquant{missing > 1 ? "s" : ""}
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="text-xs text-amber-400/70">{pending} en attente</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
