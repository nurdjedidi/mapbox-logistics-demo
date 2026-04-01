import { Link } from "react-router";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, RadialBarChart, RadialBar,
} from "recharts";
import { ArrowLeft, AlertTriangle, FileX, Ship, CheckCircle2 } from "lucide-react";
import { dossiers } from "~/data/dossiers";

export function meta() {
  return [{ title: "TransitTrack — Analytics" }];
}

const PALETTE = {
  blue:    "#3b82f6",
  blueDim: "rgba(59,130,246,0.15)",
  red:     "#ef4444",
  redDim:  "rgba(239,68,68,0.15)",
  amber:   "#f59e0b",
  amberDim:"rgba(245,158,11,0.15)",
  green:   "#10b981",
  greenDim:"rgba(16,185,129,0.15)",
  slate:   "#475569",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(8,14,30,0.97)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      {label && <p style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? "#e2e8f0", fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const totalDossiers  = dossiers.length;
  const enTransit      = dossiers.filter((d) => d.statut === "en_transit").length;
  const auPort         = dossiers.filter((d) => d.statut === "au_port").length;
  const dedouane       = dossiers.filter((d) => d.statut === "dedouane").length;
  const totalAlertes   = dossiers.reduce((s, d) => s + d.alertes.length, 0);
  const alertesHautes  = dossiers.reduce((s, d) => s + d.alertes.filter((a) => a.severite === "haute").length, 0);
  const totalDocs      = dossiers.reduce((s, d) => s + d.documents.length, 0);
  const docsRecus      = dossiers.reduce((s, d) => s + d.documents.filter((x) => x.statut === "recu").length, 0);
  const docsManquants  = dossiers.reduce((s, d) => s + d.documents.filter((x) => x.statut === "manquant").length, 0);
  const docsAttente    = dossiers.reduce((s, d) => s + d.documents.filter((x) => x.statut === "en_attente").length, 0);
  const docsCompletion = Math.round((docsRecus / totalDocs) * 100);

  const byDest = Object.entries(
    dossiers.reduce<Record<string, number>>((acc, d) => {
      acc[d.destination.nom] = (acc[d.destination.nom] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value], i) => ({ name, value, fill: `rgba(59,130,246,${0.35 + i * 0.18})` }))
    .sort((a, b) => b.value - a.value);

  const etaTimeline = [...dossiers]
    .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())
    .map((d) => ({
      name: d.id.replace("REF-2024-0", "#"),
      reçus: d.documents.filter((x) => x.statut === "recu").length,
      manquants: d.documents.filter((x) => x.statut === "manquant").length,
      attente: d.documents.filter((x) => x.statut === "en_attente").length,
    }));

  const alertesParType = [
    { name: "Surestaries", value: dossiers.reduce((s, d) => s + d.alertes.filter((a) => a.type === "surestaries").length, 0), fill: PALETTE.red },
    { name: "Docs manquants", value: dossiers.reduce((s, d) => s + d.alertes.filter((a) => a.type === "docs_manquants").length, 0), fill: PALETTE.amber },
    { name: "Geofencing", value: dossiers.reduce((s, d) => s + d.alertes.filter((a) => a.type === "geofencing").length, 0), fill: PALETTE.blue },
    { name: "Retard", value: dossiers.reduce((s, d) => s + d.alertes.filter((a) => a.type === "retard").length, 0), fill: PALETTE.slate },
  ].filter((d) => d.value > 0);

  const radialData = [
    { name: "Complétés", value: docsCompletion, fill: PALETTE.green },
  ];

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at top, #0d1f3c 0%, #020617 60%)" }}>
      <nav className="sticky top-0 z-10 flex items-center justify-between px-8 h-14"
        style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.4)" }}>
              <Ship className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">TransitTrack</span>
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-slate-400 text-sm">Analytics</span>
          </div>
        </div>
        <span className="text-slate-600 text-xs font-mono">Mars – Avril 2026</span>
      </nav>

      <div className="px-8 py-8 max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={<Ship className="w-4 h-4" />} label="Dossiers actifs" value={totalDossiers}
            sub={`${enTransit} en transit · ${auPort} au port`} color={PALETTE.blue} dimColor={PALETTE.blueDim} />
          <KpiCard icon={<CheckCircle2 className="w-4 h-4" />} label="Dossiers dédouanés" value={dedouane}
            sub={`${Math.round((dedouane / totalDossiers) * 100)}% du total`} color={PALETTE.green} dimColor={PALETTE.greenDim} />
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Alertes actives" value={totalAlertes}
            sub={`${alertesHautes} haute priorité`} color={alertesHautes > 0 ? PALETTE.red : PALETTE.amber} dimColor={alertesHautes > 0 ? PALETTE.redDim : PALETTE.amberDim} />
          <KpiCard icon={<FileX className="w-4 h-4" />} label="Docs manquants" value={docsManquants}
            sub={`${docsAttente} en attente`} color={docsManquants > 0 ? PALETTE.red : PALETTE.green} dimColor={docsManquants > 0 ? PALETTE.redDim : PALETTE.greenDim} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2" style={glass}>
            <SectionLabel>Documents par dossier (timeline ETA)</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={etaTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRecus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.green} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PALETTE.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gManquants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.red} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PALETTE.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reçus" name="Reçus" stroke={PALETTE.green} strokeWidth={2} fill="url(#gRecus)" dot={false} />
                <Area type="monotone" dataKey="manquants" name="Manquants" stroke={PALETTE.red} strokeWidth={2} fill="url(#gManquants)" dot={false} />
                <Area type="monotone" dataKey="attente" name="En attente" stroke={PALETTE.amber} strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 px-1">
              {[{ color: PALETTE.green, label: "Reçus" }, { color: PALETTE.red, label: "Manquants" }, { color: PALETTE.amber, label: "En attente" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
                  <span className="text-slate-500 text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={glass} className="flex flex-col items-center justify-center">
            <SectionLabel>Complétude documents</SectionLabel>
            <div className="relative flex items-center justify-center mt-2">
              <RadialBarChart width={180} height={180} cx={90} cy={90} innerRadius={55} outerRadius={80}
                data={radialData} startAngle={220} endAngle={-40}>
                <defs>
                  <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <RadialBar background={{ fill: "rgba(255,255,255,0.04)" }} dataKey="value" cornerRadius={8} fill="url(#radialGrad)" />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{docsCompletion}%</span>
                <span className="text-slate-500 text-xs mt-0.5">complétés</span>
              </div>
            </div>
            <div className="w-full mt-4 space-y-2 px-2">
              <DocBar label="Reçus" value={docsRecus} total={totalDocs} color={PALETTE.green} />
              <DocBar label="En attente" value={docsAttente} total={totalDocs} color={PALETTE.amber} />
              <DocBar label="Manquants" value={docsManquants} total={totalDocs} color={PALETTE.red} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div style={glass}>
            <SectionLabel>Dossiers par destination</SectionLabel>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byDest} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barCategoryGap="35%">
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" name="Dossiers" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={glass}>
            <SectionLabel>Alertes par type</SectionLabel>
            <div className="flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={alertesParType} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                    paddingAngle={4} dataKey="value" strokeWidth={0} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
              {alertesParType.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.fill }} />
                  <span className="text-xs text-slate-500 truncate">{a.name} ({a.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div style={glass}>
            <SectionLabel>Statuts dossiers</SectionLabel>
            <div className="mt-4 space-y-3">
              {[
                { label: "En transit", value: enTransit, color: PALETTE.blue },
                { label: "Au port", value: auPort, color: PALETTE.amber },
                { label: "Dédouané", value: dedouane, color: PALETTE.green },
                { label: "Livré", value: dossiers.filter((d) => d.statut === "livre").length, color: "#34d399" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">{s.label}</span>
                    <span className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(s.value / totalDossiers) * 100}%`, background: s.color, boxShadow: `0 0 8px ${s.color}66` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Temps moyen en transit</span>
                <span className="text-xs font-semibold text-slate-300">~5.2 jours</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-600">Taux de complétion</span>
                <span className="text-xs font-semibold" style={{ color: PALETTE.green }}>{docsCompletion}%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={glass}>
          <SectionLabel>Flux d'alertes critiques</SectionLabel>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {dossiers
              .filter((d) => d.alertes.length > 0)
              .flatMap((d) => d.alertes.map((a) => ({ ...a, dossierId: d.id, dest: `${d.origine.nom} → ${d.destination.nom}` })))
              .sort((a, b) => {
                const o = { haute: 0, moyenne: 1, basse: 2 };
                return o[a.severite] - o[b.severite];
              })
              .slice(0, 6)
              .map((alerte, i) => {
                const c = alerte.severite === "haute"
                  ? { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#fca5a5", dot: PALETTE.red }
                  : alerte.severite === "moyenne"
                  ? { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "#fde68a", dot: PALETTE.amber }
                  : { bg: "rgba(71,85,105,0.15)", border: "rgba(71,85,105,0.3)", text: "#94a3b8", dot: PALETTE.slate };
                return (
                  <div key={i} className="p-3 rounded-xl flex items-start gap-3"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }} />
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: c.text }}>{alerte.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono text-xs text-slate-600">{alerte.dossierId}</span>
                        <span className="text-slate-700 text-xs truncate">{alerte.dest}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}

const glass: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(8,14,30,0.8) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
  padding: "20px 24px",
  boxShadow: "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">{children}</p>;
}

function KpiCard({ icon, label, value, sub, color, dimColor }: {
  icon: React.ReactNode; label: string; value: number; sub: string; color: string; dimColor: string;
}) {
  return (
    <div style={{ ...glass, padding: "18px 20px" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-xs mb-2">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-xs mt-1.5" style={{ color: "rgba(100,116,139,0.8)" }}>{sub}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: dimColor, border: `1px solid ${color}28`, color }}>
          {icon}
        </div>
      </div>
      <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}

function DocBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{value} <span className="text-slate-700">/ {total}</span></span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}
