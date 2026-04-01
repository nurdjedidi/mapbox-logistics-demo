import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import type { Dossier, DocumentStatut } from "~/types";

interface RightPanelProps {
  dossier: Dossier;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statutLabels: Record<Dossier["statut"], { label: string; className: string }> = {
  en_transit: { label: "En transit", className: "text-blue-400" },
  au_port: { label: "Au port", className: "text-amber-400" },
  dedouane: { label: "Dédouané", className: "text-emerald-400" },
  livre: { label: "Livré", className: "text-emerald-500" },
};

const alerteColors: Record<string, { bg: string; border: string; text: string }> = {
  haute: { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)", text: "#fca5a5" },
  moyenne: { bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)", text: "#fcd34d" },
  basse: { bg: "rgba(71,85,105,0.2)", border: "rgba(71,85,105,0.3)", text: "#94a3b8" },
};

function DocStatusIcon({ statut }: { statut: DocumentStatut }) {
  if (statut === "recu") return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (statut === "en_attente") return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
}

function buildRelanceTemplate(dossier: Dossier, docLibelles: string[]): string {
  const docs = docLibelles.map((d) => `• ${d}`).join("\n");
  const plural = docLibelles.length > 1;
  return `Objet : Relance document${plural ? "s" : ""} manquant${plural ? "s" : ""} — ${dossier.id}

Bonjour,

Je reviens vers vous concernant le dossier ${dossier.id} (${dossier.vehiculeId}).

${plural ? "Les documents suivants sont toujours manquants :" : "Le document suivant est toujours manquant :"}
${docs}

Route : ${dossier.origine.nom} → ${dossier.destination.nom}
ETA : ${formatDate(dossier.eta)}

Merci de nous transmettre ce${plural ? "s documents" : " document"} en urgence afin d'éviter tout blocage au dédouanement.

Cordialement`;
}

const glassPanel = {
  background: "linear-gradient(180deg, rgba(8,16,36,0.92) 0%, rgba(4,10,24,0.95) 100%)",
  backdropFilter: "blur(20px) saturate(180%)",
  borderLeft: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "-4px 0 32px rgba(0,0,0,0.5)",
};

const sectionDivider = { borderBottom: "1px solid rgba(255,255,255,0.05)" };

export default function RightPanel({ dossier, onClose }: RightPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyTemplate = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    });
  };

  const missingDocs = dossier.documents.filter((d) => d.statut === "manquant");
  const docsOk = dossier.documents.filter((d) => d.statut === "recu").length;
  const docsTotal = dossier.documents.length;
  const progress = Math.round((docsOk / docsTotal) * 100);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-14 right-0 bottom-0 w-88 z-10 flex flex-col overflow-hidden"
      style={{ ...glassPanel, width: "22rem" }}
    >
      <div className="flex items-start justify-between px-5 py-4" style={sectionDivider}>
        <div>
          <span className="font-mono text-sm font-bold text-white tracking-wide">{dossier.id}</span>
          <p className="text-slate-500 text-xs mt-0.5 font-mono">{dossier.vehiculeId}</p>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors cursor-pointer mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        <div className="px-5 py-4" style={sectionDivider}>
          <div className="space-y-2">
            {[
              ["Route", `${dossier.origine.nom} → ${dossier.destination.nom}`],
              ["Départ", formatDate(dossier.depart)],
              ["ETA", formatDate(dossier.eta)],
              ["Fournisseur", dossier.fournisseur],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-600">{label}</span>
                <span className="text-slate-300">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Statut</span>
              <span className={`font-medium ${statutLabels[dossier.statut].className}`}>
                {statutLabels[dossier.statut].label}
              </span>
            </div>
          </div>
        </div>

        {dossier.alertes.length > 0 && (
          <div className="px-5 py-4" style={sectionDivider}>
            <p className="text-slate-600 text-xs uppercase tracking-widest font-semibold mb-3">
              Alertes ({dossier.alertes.length})
            </p>
            <div className="space-y-2">
              {dossier.alertes.map((alerte, i) => {
                const c = alerteColors[alerte.severite];
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg text-xs"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 opacity-80" />
                    <span>{alerte.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-5 py-4" style={sectionDivider}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-xs uppercase tracking-widest font-semibold">Documents douane</p>
            <span className="text-xs font-mono text-slate-500">{docsOk}/{docsTotal}</span>
          </div>

          <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#10b981" : progress >= 60 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>

          <div className="space-y-2.5">
            {dossier.documents.map((doc) => (
              <div key={doc.type} className="flex items-center gap-2.5">
                <DocStatusIcon statut={doc.statut} />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs block ${
                    doc.statut === "recu" ? "text-slate-400" :
                    doc.statut === "en_attente" ? "text-amber-300/80" : "text-red-300/90"
                  }`}>
                    {doc.libelle}
                  </span>
                  {doc.statut === "recu" && doc.dateReception && (
                    <span className="text-slate-700 text-xs">Reçu le {doc.dateReception}</span>
                  )}
                  {doc.statut === "manquant" && doc.derniereRelance && (
                    <span className="text-slate-600 text-xs">Relancé le {doc.derniereRelance}</span>
                  )}
                </div>
                {doc.statut === "manquant" && doc.fournisseur && (
                  <button
                    onClick={() => copyTemplate(doc.type, buildRelanceTemplate(dossier, [doc.libelle]))}
                    className="shrink-0 text-xs px-2 py-1 rounded-md transition-all cursor-pointer"
                    style={{
                      background: copied === doc.type ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${copied === doc.type ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: copied === doc.type ? "#6ee7b7" : "#94a3b8",
                    }}
                  >
                    {copied === doc.type ? "Copié" : "Relancer"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {missingDocs.length > 0 && (
          <div className="px-5 py-4">
            <button
              onClick={() => copyTemplate("__all__", buildRelanceTemplate(dossier, missingDocs.map((d) => d.libelle)))}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: copied === "__all__"
                  ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))"
                  : "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(29,78,216,0.3))",
                border: `1px solid ${copied === "__all__" ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.35)"}`,
                color: copied === "__all__" ? "#6ee7b7" : "#93c5fd",
                boxShadow: copied === "__all__" ? "0 0 16px rgba(16,185,129,0.15)" : "0 0 16px rgba(37,99,235,0.15)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
              {copied === "__all__"
                ? "Copié dans le presse-papier"
                : `Relancer fournisseur (${missingDocs.length} doc${missingDocs.length > 1 ? "s" : ""})`}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
