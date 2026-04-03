import { AnimatePresence, motion } from "framer-motion";
import { X, Navigation, AlertTriangle } from "lucide-react";
import type { GeofenceAlert } from "~/hooks/useGeofencing";

interface GeofenceToastsProps {
  alerts: GeofenceAlert[];
  onDismiss: (id: string) => void;
  isMobile?: boolean;
}

export default function GeofenceToasts({ alerts, onDismiss, isMobile = false }: GeofenceToastsProps) {
  if (alerts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 pointer-events-none ${
        isMobile
          ? "bottom-20 left-0 right-0 px-3 items-center"
          : "bottom-6 right-4 items-end w-80"
      }`}
    >
      <AnimatePresence initial={false}>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className={`pointer-events-auto flex items-start gap-3 px-3.5 py-3 rounded-xl ${isMobile ? "w-full max-w-sm" : "w-full"}`}
            style={{
              background: "linear-gradient(135deg, rgba(8,14,30,0.96) 0%, rgba(4,10,24,0.98) 100%)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${alert.hasDocIssue ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.3)"}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 20px ${alert.hasDocIssue ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)"}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: alert.hasDocIssue ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.12)",
                border: `1px solid ${alert.hasDocIssue ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.2)"}`,
              }}
            >
              {alert.hasDocIssue
                ? <AlertTriangle className="w-4 h-4 text-red-400" />
                : <Navigation className="w-4 h-4 text-amber-400" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: alert.hasDocIssue ? "#f87171" : "#fbbf24" }}
                >
                  Approche port
                </span>
                <span className="text-xs font-mono text-slate-500">{alert.dossierId}</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                <span className="font-medium text-white">{alert.portNom}</span>
                {" "}à <span className="font-mono font-semibold" style={{ color: alert.hasDocIssue ? "#fca5a5" : "#fde68a" }}>{alert.distanceKm} km</span>
              </p>
              {alert.hasDocIssue && (
                <p className="text-xs text-red-400/80 mt-0.5">Documents incomplets — action requise</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="shrink-0 text-slate-700 hover:text-slate-400 transition-colors cursor-pointer mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
