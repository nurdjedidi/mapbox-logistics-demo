import { Ship, Bell, User, BarChart2, Menu, X } from "lucide-react";
import { Link } from "react-router";
import type { Dossier } from "~/types";

interface HeaderProps {
  dossiers: Dossier[];
  showAnalyticsLink?: boolean;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
}

export default function Header({ dossiers, showAnalyticsLink = true, panelOpen, onTogglePanel }: HeaderProps) {
  const totalAlertes = dossiers.reduce((sum, d) => sum + d.alertes.length, 0);
  const alertesHautes = dossiers.reduce(
    (sum, d) => sum + d.alertes.filter((a) => a.severite === "haute").length,
    0
  );

  return (
    <header className="absolute top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4 sm:px-6"
      style={{
        background: "linear-gradient(180deg, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.7) 100%)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-3">
        {onTogglePanel && (
          <button
            onClick={onTogglePanel}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {panelOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.5)" }}>
          <Ship className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">TransitTrack</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xl font-bold text-white">{dossiers.length}</span>
          <span className="text-slate-500 text-xs">Dossiers</span>
        </div>
        <div className="hidden sm:block w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="flex items-center gap-2">
          <Bell className={`w-3.5 h-3.5 ${alertesHautes > 0 ? "text-red-400" : "text-amber-400"}`} />
          <span className={`text-base font-bold ${alertesHautes > 0 ? "text-red-400" : "text-amber-400"}`}>{totalAlertes}</span>
          <span className="hidden sm:inline text-slate-500 text-xs">Alertes</span>
          {alertesHautes > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        </div>
        <div className="hidden sm:block w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
        {showAnalyticsLink && (
          <Link
            to="/analytics"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>
        )}
        <div className="hidden sm:block w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <User className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <span className="hidden sm:inline text-slate-300 text-sm">User</span>
        </div>
      </div>
    </header>
  );
}
