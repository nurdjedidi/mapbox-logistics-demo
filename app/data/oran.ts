import type { Dossier } from "~/types";

// — Oran coastal waypoints —
const ORAN_PORT: [number, number] = [-0.63, 35.70];

// — Algerian coast — offshore waypoints (5-10nm north of coast to stay at sea) —
const MOSTAGANEM_OFFSHORE: [number, number] = [0.09, 36.05];
const TENES_OFFSHORE: [number, number] = [1.30, 36.55];
const ALGER_OFFSHORE: [number, number] = [3.06, 36.90];
const DELYS_OFFSHORE: [number, number] = [3.90, 36.85];
const BEJAIA_OFFSHORE: [number, number] = [5.07, 36.92];

// — Balearic Sea —
const ORAN_NORTH: [number, number] = [-0.30, 36.50];
const ALBORAN: [number, number] = [-3.0, 36.0];
const ALMERIA: [number, number] = [-2.46, 36.84];
const IBIZA: [number, number] = [1.4, 38.9];
const VALENCE: [number, number] = [-0.38, 39.47];

// — Western Mediterranean —
const CARTHAGE: [number, number] = [10.3, 37.0];
const SARDINIA_W: [number, number] = [8.5, 39.5];
const MENORCA: [number, number] = [4.2, 39.9];
const GULF_LION: [number, number] = [4.0, 42.8];
const MARSEILLE: [number, number] = [5.37, 43.30];

export const portsOran = {
  oran: { lat: 35.70, lng: -0.63, nom: "Oran" },
  mostaganem: { lat: 35.93, lng: 0.09, nom: "Mostaganem" },
  bejaia: { lat: 36.75, lng: 5.07, nom: "Bejaïa" },
  alger: { lat: 36.77, lng: 3.06, nom: "Alger" },
  marseille: { lat: 43.30, lng: 5.37, nom: "Marseille" },
  valence: { lat: 39.47, lng: -0.38, nom: "Valence" },
  almeria: { lat: 36.84, lng: -2.46, nom: "Almería" },
};

// Route: Oran → Marseille (via offshore Algerian coast + Mediterranean)
const routeOranMarseille: [number, number][] = [
  ORAN_PORT, MOSTAGANEM_OFFSHORE, TENES_OFFSHORE, ALGER_OFFSHORE, DELYS_OFFSHORE, BEJAIA_OFFSHORE,
  CARTHAGE, SARDINIA_W, GULF_LION, MARSEILLE,
];

// Route: Oran → Valence (via Alboran Sea)
const routeOranValence: [number, number][] = [
  ORAN_PORT, ORAN_NORTH, ALBORAN, ALMERIA, IBIZA, VALENCE,
];

// Route: Oran → Almería (short hop)
const routeOranAlmeria: [number, number][] = [
  ORAN_PORT, ORAN_NORTH, ALBORAN, ALMERIA,
];

// Route: Mostaganem → Marseille (via offshore Algerian coast + Mediterranean)
const routeMostaganemMarseille: [number, number][] = [
  ORAN_PORT, MOSTAGANEM_OFFSHORE, TENES_OFFSHORE, ALGER_OFFSHORE, DELYS_OFFSHORE, BEJAIA_OFFSHORE,
  CARTHAGE, SARDINIA_W, GULF_LION, MARSEILLE,
];

// Route: Oran → Bejaïa (coastal — offshore waypoints to stay at sea)
const routeOranBejaia: [number, number][] = [
  ORAN_PORT, MOSTAGANEM_OFFSHORE, TENES_OFFSHORE, ALGER_OFFSHORE, DELYS_OFFSHORE, BEJAIA_OFFSHORE,
];

function segLen(a: [number, number], b: [number, number]): number {
  const dx = (b[0] - a[0]) * Math.cos(((a[1] + b[1]) * Math.PI) / 360);
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function pointAlongRoute(route: [number, number][], t: number): { lat: number; lng: number } {
  if (t <= 0) return { lng: route[0][0], lat: route[0][1] };
  if (t >= 1) return { lng: route[route.length - 1][0], lat: route[route.length - 1][1] };
  const lengths = route.slice(0, -1).map((p, i) => segLen(p, route[i + 1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  let remaining = t * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const s = remaining / lengths[i];
      return {
        lng: route[i][0] + (route[i + 1][0] - route[i][0]) * s,
        lat: route[i][1] + (route[i + 1][1] - route[i][1]) * s,
      };
    }
    remaining -= lengths[i];
  }
  const last = route[route.length - 1];
  return { lng: last[0], lat: last[1] };
}

function mk(
  id: string,
  vehiculeId: string,
  route: [number, number][],
  progress: number,
  depart: string,
  eta: string,
  statut: Dossier["statut"],
  fournisseur: string,
  documents: Dossier["documents"],
  alertes: Dossier["alertes"],
  originOverride?: { lng: number; lat: number; nom: string },
  destOverride?: { lng: number; lat: number; nom: string }
): Dossier {
  const origine = originOverride ?? Object.values(portsOran).find(
    (p) => Math.abs(p.lng - route[0][0]) < 0.1 && Math.abs(p.lat - route[0][1]) < 0.1
  ) ?? { lng: route[0][0], lat: route[0][1], nom: "?" };

  const dest = destOverride ?? Object.values(portsOran).find(
    (p) => Math.abs(p.lng - route[route.length - 1][0]) < 0.1 && Math.abs(p.lat - route[route.length - 1][1]) < 0.1
  ) ?? { lng: route[route.length - 1][0], lat: route[route.length - 1][1], nom: "?" };

  return {
    id,
    type: "maritime",
    vehiculeId,
    origine,
    destination: dest,
    depart,
    eta,
    route,
    progress,
    positionActuelle: statut === "au_port" || statut === "dedouane" || statut === "livre"
      ? { lng: dest.lng, lat: dest.lat }
      : pointAlongRoute(route, progress),
    statut,
    fournisseur,
    documents,
    alertes,
  };
}

export const dossiersOran: Dossier[] = [
  // ~92% → approaching Marseille → geofence
  mk(
    "OR-2026-001", "CNAN881001", routeOranMarseille, 0.92,
    "2026-03-15T06:00:00", "2026-04-05T08:00:00", "en_transit", "Oran Export Fruits SARL",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "13/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "14/03" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Oran Export Fruits SARL", derniereRelance: "28/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "15/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "13/03" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — arrivée Marseille imminente", timestamp: "2026-04-01T10:00:00" },
      { type: "surestaries", severite: "haute", message: "Surestaries J-4 si EUR1 non reçu", timestamp: "2026-04-01T10:00:00" },
    ]
  ),
  // ~55% → Balearic Sea
  mk(
    "OR-2026-002", "ENTMV5522002", routeOranValence, 0.55,
    "2026-03-20T08:00:00", "2026-04-10T14:00:00", "en_transit", "Mostaganem Agriculture Coop",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "18/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "19/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "20/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "18/03" },
    ],
    []
  ),
  // ~90% → approaching Almería
  mk(
    "OR-2026-003", "CNAN7733003", routeOranAlmeria, 0.90,
    "2026-03-25T10:00:00", "2026-04-02T16:00:00", "en_transit", "Oran Textile Export Co",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "23/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "en_attente", fournisseur: "Oran Textile Export Co" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "25/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "23/03" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "Certificat d'origine en attente — Almería dans ~1 jour", timestamp: "2026-04-01T08:00:00" },
    ]
  ),
  // at port Marseille (from Mostaganem)
  mk(
    "OR-2026-004", "ENTMV4444004", routeMostaganemMarseille, 1,
    "2026-03-01T06:00:00", "2026-03-28T12:00:00", "au_port", "Mostaganem Port Logistics",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "27/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "28/02" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Mostaganem Port Logistics", derniereRelance: "25/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "01/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "27/02" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port de Marseille", timestamp: "2026-03-28T11:00:00" },
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — conteneur bloqué à Marseille", timestamp: "2026-03-28T12:00:00" },
    ],
    portsOran.mostaganem,
    portsOran.marseille
  ),
  // ~35% → just left Oran
  mk(
    "OR-2026-005", "CNAN9955005", routeOranMarseille, 0.35,
    "2026-03-28T07:00:00", "2026-04-15T10:00:00", "en_transit", "Oran Pharma Industries",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "26/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "27/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "28/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "26/03" },
    ],
    [
      { type: "retard", severite: "basse", message: "ETA décalé +12h — conditions météo en Méditerranée", timestamp: "2026-03-30T06:00:00" },
    ]
  ),
  // ~70% → Sardinia
  mk(
    "OR-2026-006", "ENTMV6666006", routeOranMarseille, 0.70,
    "2026-03-10T09:00:00", "2026-04-08T18:00:00", "en_transit", "Bejaïa Mineral Water SA",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "08/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "09/03" },
      { type: "eur1", libelle: "EUR1", statut: "en_attente", fournisseur: "Bejaïa Mineral Water SA" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "10/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "08/03" },
    ],
    []
  ),
  // dédouané
  mk(
    "OR-2026-007", "CNAN7777007", routeOranValence, 1,
    "2026-03-05T06:00:00", "2026-03-25T14:00:00", "dedouane", "Oran Ceramique Export",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "03/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "04/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "04/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "05/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "03/03" },
    ],
    []
  ),
  // ~45% → Alboran Sea
  mk(
    "OR-2026-008", "ENTMV8888008", routeOranValence, 0.45,
    "2026-03-22T10:00:00", "2026-04-12T12:00:00", "en_transit", "Alger Steel Products",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "20/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "Alger Steel Products" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "en_attente", fournisseur: "Alger Steel Products" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "20/03" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "Certificat d'origine + B/L manquants", timestamp: "2026-03-30T09:00:00" },
    ]
  ),
  // ~15% — just left Oran coastal (→ Bejaïa)
  mk(
    "OR-2026-009", "CNAN1199009", routeOranBejaia, 0.15,
    "2026-04-01T08:00:00", "2026-04-06T16:00:00", "en_transit", "Oran Coastal Shipping",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "30/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "31/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "01/04" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "30/03" },
    ],
    [],
    undefined,
    portsOran.bejaia
  ),
  // ~88% → approaching Valence → geofence
  mk(
    "OR-2026-010", "ENTMV2200010", routeOranValence, 0.88,
    "2026-03-18T06:00:00", "2026-04-04T10:00:00", "en_transit", "Oran Dattes Premium SARL",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "16/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "17/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "17/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "18/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "16/03" },
    ],
    []
  ),
];
