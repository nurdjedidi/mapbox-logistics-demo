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

  // On mobile show max 2, on desktop max 4
  const visible = isMobile ? alerts.slice(0, 2) : alerts.slice(0, 4);

  if (isMobile) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 flex flex-col gap-1.5 px-3 pointer-events-none">
        <AnimatePresence initial={false}>
          {visible.map((alert) => (
            <Toast key={alert.id} alert={alert} onDismiss={onDismiss} compact />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence initial={false}>
        {visible.map((alert) => (
          <Toast key={alert.id} alert={alert} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ alert, onDismiss, compact = false }: {
  alert: GeofenceAlert;
  onDismiss: (id: string) => void;
  compact?: boolean;
}) {
  const isRed = alert.hasDocIssue;

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? -12 : 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="pointer-events-auto flex items-center gap-2.5 rounded-xl w-full"
      style={{
        padding: compact ? "8px 12px" : "12px 14px",
        background: "linear-gradient(135deg, rgba(8,14,30,0.97) 0%, rgba(4,10,24,0.99) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isRed ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.3)"}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${isRed ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.06)"}`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isRed ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.12)",
          border: `1px solid ${isRed ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        {isRed
          ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          : <Navigation className="w-3.5 h-3.5 text-amber-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isRed ? "#f87171" : "#fbbf24" }}>
            Approche
          </span>
          <span className="font-medium text-white text-xs truncate">{alert.portNom}</span>
          <span className="font-mono text-xs shrink-0" style={{ color: isRed ? "#fca5a5" : "#fde68a" }}>
            {alert.distanceKm} km
          </span>
        </div>
        {!compact && alert.hasDocIssue && (
          <p className="text-xs text-red-400/80 mt-0.5 truncate">
            <span className="font-mono text-slate-500 mr-1">{alert.dossierId}</span>
            Documents incomplets — action requise
          </p>
        )}
        {compact && (
          <p className="text-xs text-slate-500 truncate font-mono">{alert.dossierId}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(alert.id)}
        className="shrink-0 text-slate-700 hover:text-slate-400 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
