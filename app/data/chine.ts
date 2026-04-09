import type { Dossier } from "~/types";

export const portsChine = {
  shanghai: { lat: 31.23, lng: 121.47, nom: "Shanghai" },
  shenzhen: { lat: 22.54, lng: 114.05, nom: "Shenzhen" },
  ningbo: { lat: 29.87, lng: 121.55, nom: "Ningbo" },
  leHavre: { lat: 49.48, lng: 0.11, nom: "Le Havre" },
  marseille: { lat: 43.30, lng: 5.37, nom: "Marseille" },
  fos: { lat: 43.41, lng: 4.93, nom: "Fos-sur-Mer" },
};

// — South China Sea corridor —
const SCS_N: [number, number] = [117.0, 20.0];
const SCS_MID: [number, number] = [113.0, 12.0];
const SCS_S: [number, number] = [109.0, 7.0];

// — Malacca Strait —
const MALACCA_E: [number, number] = [104.5, 1.5];
const MALACCA_W: [number, number] = [98.5, 4.5];

// — Indian Ocean —
const ANDAMAN: [number, number] = [92.0, 7.0];
const SRI_LANKA_S: [number, number] = [80.5, 5.5];
const ARABIAN_SEA: [number, number] = [65.0, 12.0];

// — Gulf of Aden / Red Sea —
const GULF_ADEN_E: [number, number] = [52.0, 12.5];
const GULF_ADEN_W: [number, number] = [45.0, 12.5];
const BAB_EL_MANDEB: [number, number] = [43.4, 12.5];
const RED_SEA_S: [number, number] = [42.5, 14.8];
const RED_SEA_MID: [number, number] = [39.5, 19.0];
const RED_SEA_UPPER: [number, number] = [36.5, 24.0];
const GULF_SUEZ: [number, number] = [33.9, 27.6];
const SUEZ_S: [number, number] = [32.56, 29.93];
const PORT_SAID: [number, number] = [32.31, 31.26];

// — Mediterranean —
const CRETE_S: [number, number] = [24.0, 34.5];
const MALTA: [number, number] = [14.5, 35.9];
const SARDINIA_S: [number, number] = [9.5, 38.5];
const GULF_LION: [number, number] = [4.0, 42.8];

// — Bay of Biscay (Le Havre) —
const GIBRALTAR_W: [number, number] = [-5.6, 35.95];
const PORTUGAL: [number, number] = [-9.5, 38.5];
const FINISTERRE: [number, number] = [-9.0, 43.0];
const BISCAY: [number, number] = [-5.0, 46.5];
const CHANNEL_W: [number, number] = [-2.0, 48.5];

// Shared corridor: China coast → Suez
const CHINA_TO_SUEZ: [number, number][] = [
  SCS_N, SCS_MID, SCS_S,
  MALACCA_E, MALACCA_W, ANDAMAN, SRI_LANKA_S, ARABIAN_SEA,
  GULF_ADEN_E, GULF_ADEN_W, BAB_EL_MANDEB,
  RED_SEA_S, RED_SEA_MID, RED_SEA_UPPER, GULF_SUEZ, SUEZ_S, PORT_SAID,
];

// Suez → Marseille / Fos
const SUEZ_TO_MARSEILLE: [number, number][] = [
  CRETE_S, MALTA, SARDINIA_S, GULF_LION,
];

// Suez → Le Havre
const SUEZ_TO_LE_HAVRE: [number, number][] = [
  CRETE_S, MALTA, SARDINIA_S,
  GIBRALTAR_W, PORTUGAL, FINISTERRE, BISCAY, CHANNEL_W,
];

// Full routes
const routeShanghaiMarseille: [number, number][] = [
  [121.47, 31.23], ...CHINA_TO_SUEZ, ...SUEZ_TO_MARSEILLE, [5.37, 43.30],
];

const routeShanghaiLeHavre: [number, number][] = [
  [121.47, 31.23], ...CHINA_TO_SUEZ, ...SUEZ_TO_LE_HAVRE, [0.11, 49.48],
];

const routeShenzhenMarseille: [number, number][] = [
  [114.05, 22.54], SCS_MID, SCS_S,
  MALACCA_E, MALACCA_W, ANDAMAN, SRI_LANKA_S, ARABIAN_SEA,
  GULF_ADEN_E, GULF_ADEN_W, BAB_EL_MANDEB,
  RED_SEA_S, RED_SEA_MID, RED_SEA_UPPER, GULF_SUEZ, SUEZ_S, PORT_SAID,
  ...SUEZ_TO_MARSEILLE, [5.37, 43.30],
];

const routeShenzhenLeHavre: [number, number][] = [
  [114.05, 22.54], SCS_MID, SCS_S,
  MALACCA_E, MALACCA_W, ANDAMAN, SRI_LANKA_S, ARABIAN_SEA,
  GULF_ADEN_E, GULF_ADEN_W, BAB_EL_MANDEB,
  RED_SEA_S, RED_SEA_MID, RED_SEA_UPPER, GULF_SUEZ, SUEZ_S, PORT_SAID,
  ...SUEZ_TO_LE_HAVRE, [0.11, 49.48],
];

const routeNingboFos: [number, number][] = [
  [121.55, 29.87], ...CHINA_TO_SUEZ, ...SUEZ_TO_MARSEILLE, [4.93, 43.41],
];

const routeNingboLeHavre: [number, number][] = [
  [121.55, 29.87], ...CHINA_TO_SUEZ, ...SUEZ_TO_LE_HAVRE, [0.11, 49.48],
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
  alertes: Dossier["alertes"]
): Dossier {
  const origine = Object.values(portsChine).find(
    (p) => Math.abs(p.lng - route[0][0]) < 0.1 && Math.abs(p.lat - route[0][1]) < 0.1
  ) ?? { lng: route[0][0], lat: route[0][1], nom: "?" };

  const dest = Object.values(portsChine).find(
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

export const dossiersChine: Dossier[] = [
  // ~92% → approaching Marseille → geofence
  mk(
    "CN-2026-001", "COSCO881001", routeShanghaiMarseille, 0.92,
    "2026-02-28T06:00:00", "2026-04-02T08:00:00", "en_transit", "Shanghai MegaTrade Co",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "25/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "26/02" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Shanghai MegaTrade Co", derniereRelance: "25/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "28/02" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "25/02" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — arrivée Marseille imminente", timestamp: "2026-03-28T10:00:00" },
      { type: "surestaries", severite: "haute", message: "Surestaries J-4 si EUR1 non reçu", timestamp: "2026-03-28T10:00:00" },
    ]
  ),
  // ~55% → Indian Ocean
  mk(
    "CN-2026-002", "OOCL5522002", routeShanghaiLeHavre, 0.55,
    "2026-03-10T08:00:00", "2026-04-12T14:00:00", "en_transit", "Yangtze Freight Int'l",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "08/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "09/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "10/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "08/03" },
    ],
    []
  ),
  // ~90% → approaching Le Havre → geofence
  mk(
    "CN-2026-003", "EVER7733003", routeShenzhenLeHavre, 0.90,
    "2026-03-01T10:00:00", "2026-04-04T16:00:00", "en_transit", "Shenzhen Electronics Export",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "27/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "en_attente", fournisseur: "Shenzhen Electronics Export" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "01/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "27/02" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "Certificat d'origine en attente — Le Havre dans ~3 jours", timestamp: "2026-03-30T08:00:00" },
    ]
  ),
  // at port Marseille
  mk(
    "CN-2026-004", "CMAG4444004", routeShenzhenMarseille, 1,
    "2026-02-20T06:00:00", "2026-03-25T12:00:00", "au_port", "GD Manufacturing Ltd",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "18/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "19/02" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "GD Manufacturing Ltd", derniereRelance: "20/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "20/02" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "18/02" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port de Marseille", timestamp: "2026-03-25T11:00:00" },
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — conteneur bloqué à Marseille", timestamp: "2026-03-25T12:00:00" },
    ]
  ),
  // ~35% → South China Sea
  mk(
    "CN-2026-005", "COSCO9955005", routeNingboLeHavre, 0.35,
    "2026-03-15T07:00:00", "2026-04-18T10:00:00", "en_transit", "Ningbo Eastport Trading",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "13/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "14/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "15/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "13/03" },
    ],
    [
      { type: "retard", severite: "basse", message: "ETA décalé +18h — congestion détroit de Malacca", timestamp: "2026-03-25T06:00:00" },
    ]
  ),
  // ~70% → Red Sea
  mk(
    "CN-2026-006", "HMMU6666006", routeShanghaiMarseille, 0.70,
    "2026-03-05T09:00:00", "2026-04-08T18:00:00", "en_transit", "Pacific Orient Logistics",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "03/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "04/03" },
      { type: "eur1", libelle: "EUR1", statut: "en_attente", fournisseur: "Pacific Orient Logistics" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "05/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "03/03" },
    ],
    []
  ),
  // dédouané
  mk(
    "CN-2026-007", "OOCL7777007", routeNingboFos, 1,
    "2026-02-15T06:00:00", "2026-03-20T14:00:00", "dedouane", "Zhejiang Import-Export Corp",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "13/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "14/02" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "14/02" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "15/02" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "13/02" },
    ],
    []
  ),
  // ~45% → Strait of Malacca
  mk(
    "CN-2026-008", "EVER8888008", routeShenzhenMarseille, 0.45,
    "2026-03-12T10:00:00", "2026-04-15T12:00:00", "en_transit", "PRD Cargo Solutions",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "10/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "PRD Cargo Solutions" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "en_attente", fournisseur: "PRD Cargo Solutions" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "10/03" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "Certificat d'origine + B/L manquants", timestamp: "2026-03-28T09:00:00" },
    ]
  ),
  // ~15% — just left Shanghai
  mk(
    "CN-2026-009", "COSCO1199009", routeShanghaiLeHavre, 0.15,
    "2026-03-28T08:00:00", "2026-05-01T16:00:00", "en_transit", "Jiangsu Global Trade",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "26/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "27/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "28/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "26/03" },
    ],
    []
  ),
  // ~88% → approaching Fos → geofence
  mk(
    "CN-2026-010", "HMMU2200010", routeNingboFos, 0.88,
    "2026-03-02T06:00:00", "2026-04-05T10:00:00", "en_transit", "East China Shipping Co",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "28/02" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "01/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "01/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "02/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "28/02" },
    ],
    []
  ),
];
