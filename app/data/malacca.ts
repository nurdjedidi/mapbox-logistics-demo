import type { Dossier } from "~/types";

export const portsMalacca = {
  shanghai: { lat: 31.23, lng: 121.47, nom: "Shanghai" },
  guangzhou: { lat: 22.75, lng: 113.53, nom: "Guangzhou" },
  hongkong: { lat: 22.32, lng: 114.17, nom: "Hong Kong" },
  singapore: { lat: 1.29, lng: 103.85, nom: "Singapore" },
  portKlang: { lat: 3.0, lng: 101.38, nom: "Port Klang" },
  jakarta: { lat: -6.11, lng: 106.88, nom: "Tanjung Priok" },
};

// South China Sea corridor
const EAST_CHINA_SEA: [number, number] = [122.0, 29.0];
const TAIWAN_STRAIT_S: [number, number] = [119.5, 22.0];
const SCS_NORTH: [number, number] = [116.0, 17.0];
const SCS_MID: [number, number] = [113.0, 12.0];
const SCS_SOUTH: [number, number] = [109.0, 7.0];
const SCS_SW: [number, number] = [106.0, 3.5];
const GZ_DEPART: [number, number] = [114.0, 18.0];

// Malacca / Singapore approaches
const SINGAPORE_APPROACH: [number, number] = [104.5, 1.5];
const MALACCA_ENTRY: [number, number] = [104.0, 2.5];
const MALACCA_MID: [number, number] = [102.5, 2.8];
const MALACCA_N: [number, number] = [101.5, 3.5];

// Karimata strait (Jakarta approach)
const KARIMATA: [number, number] = [108.0, 3.5];
const JAVA_SEA: [number, number] = [107.5, 0.5];
const JAVA_SEA_S: [number, number] = [107.0, -3.0];

const routeShanghaiToSingapore: [number, number][] = [
  [121.47, 31.23], EAST_CHINA_SEA, TAIWAN_STRAIT_S,
  SCS_NORTH, SCS_MID, SCS_SOUTH, SCS_SW,
  SINGAPORE_APPROACH, [103.85, 1.29],
];

const routeShanghaiToPortKlang: [number, number][] = [
  [121.47, 31.23], EAST_CHINA_SEA, TAIWAN_STRAIT_S,
  SCS_NORTH, SCS_MID, SCS_SOUTH, SCS_SW,
  MALACCA_ENTRY, MALACCA_MID, MALACCA_N, [101.38, 3.0],
];

const routeGuangzhouToSingapore: [number, number][] = [
  [113.53, 22.75], GZ_DEPART,
  SCS_MID, SCS_SOUTH, SCS_SW,
  SINGAPORE_APPROACH, [103.85, 1.29],
];

const routeGuangzhouToPortKlang: [number, number][] = [
  [113.53, 22.75], GZ_DEPART,
  SCS_MID, SCS_SOUTH, SCS_SW,
  MALACCA_ENTRY, MALACCA_MID, MALACCA_N, [101.38, 3.0],
];

const routeHKToJakarta: [number, number][] = [
  [114.17, 22.32], GZ_DEPART,
  SCS_MID, SCS_SOUTH, KARIMATA,
  JAVA_SEA, JAVA_SEA_S, [106.88, -6.11],
];

const routeHKToSingapore: [number, number][] = [
  [114.17, 22.32], GZ_DEPART,
  SCS_MID, SCS_SOUTH, SCS_SW,
  SINGAPORE_APPROACH, [103.85, 1.29],
];

const routeHKToPortKlang: [number, number][] = [
  [114.17, 22.32], GZ_DEPART,
  SCS_MID, SCS_SOUTH, SCS_SW,
  MALACCA_ENTRY, MALACCA_MID, MALACCA_N, [101.38, 3.0],
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
  const origine = Object.values(portsMalacca).find(
    (p) => Math.abs(p.lng - route[0][0]) < 0.1 && Math.abs(p.lat - route[0][1]) < 0.1
  ) ?? { lng: route[0][0], lat: route[0][1], nom: "?" };

  const dest = Object.values(portsMalacca).find(
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

export const dossiersMalacca: Dossier[] = [
  // progress 0.91 → ~380km from Singapore → geofence trigger
  mk(
    "MY-2026-001", "MSCU8891001", routeShanghaiToSingapore, 0.91,
    "2026-03-18T08:00:00", "2026-04-04T10:00:00", "en_transit", "SinoTrade Shanghai",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "15/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "16/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "18/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "15/03" },
    ],
    []
  ),
  // progress 0.88 → ~420km from Port Klang → geofence trigger
  mk(
    "MY-2026-002", "CMAU5562002", routeShanghaiToPortKlang, 0.88,
    "2026-03-20T06:00:00", "2026-04-05T14:00:00", "en_transit", "Dragon Pacific Logistics",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "18/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "Dragon Pacific Logistics", derniereRelance: "30/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "20/03" },
      { type: "packing_list", libelle: "Packing List", statut: "en_attente", fournisseur: "Dragon Pacific Logistics" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "Certificat d'origine manquant — arrivée Port Klang imminente", timestamp: "2026-03-31T09:00:00" },
    ]
  ),
  // progress 0.93 → ~250km from Singapore → strong geofence trigger
  mk(
    "MY-2026-003", "EVRU7713003", routeGuangzhouToSingapore, 0.93,
    "2026-03-22T10:00:00", "2026-04-03T08:00:00", "en_transit", "Canton Export Ltd",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "20/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "21/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "22/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "20/03" },
    ],
    []
  ),
  mk(
    "MY-2026-004", "HLXU4424004", routeGuangzhouToPortKlang, 0.5,
    "2026-03-25T07:00:00", "2026-04-08T16:00:00", "en_transit", "Pearl River Freight",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "23/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "24/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "25/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "23/03" },
    ],
    []
  ),
  // progress 0.90 → ~330km from Jakarta → geofence trigger
  mk(
    "MY-2026-005", "OOLU3335005", routeHKToJakarta, 0.90,
    "2026-03-21T09:00:00", "2026-04-04T12:00:00", "en_transit", "HK Pacific Trading",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "19/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "20/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "en_attente", fournisseur: "HK Pacific Trading" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "19/03" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "B/L en attente — relancer HK Pacific Trading", timestamp: "2026-03-30T10:00:00" },
    ]
  ),
  mk(
    "MY-2026-006", "APMU6646006", routeHKToSingapore, 0.35,
    "2026-03-26T08:00:00", "2026-04-09T18:00:00", "en_transit", "Victoria Harbour Shipping",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "24/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "25/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "26/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "24/03" },
    ],
    []
  ),
  mk(
    "MY-2026-007", "ZIMU9957007", routeShanghaiToSingapore, 0.6,
    "2026-03-19T06:00:00", "2026-04-06T09:00:00", "en_transit", "Yangtze Global Cargo",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "17/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "18/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "19/03" },
      { type: "packing_list", libelle: "Packing List", statut: "manquant", fournisseur: "Yangtze Global Cargo" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "Packing List manquante — à régulariser avant Singapore", timestamp: "2026-03-31T07:00:00" },
    ]
  ),
  mk(
    "MY-2026-008", "MSDU1168008", routeGuangzhouToSingapore, 1,
    "2026-03-15T10:00:00", "2026-03-28T14:00:00", "au_port", "Southern Star Freight",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "13/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "14/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "15/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "13/03" },
    ],
    []
  ),
  mk(
    "MY-2026-009", "COSU2279009", routeHKToPortKlang, 0.72,
    "2026-03-22T07:00:00", "2026-04-05T16:00:00", "en_transit", "Kowloon Maritime Co",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "20/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "21/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "22/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "20/03" },
    ],
    []
  ),
  mk(
    "MY-2026-010", "TEMU3390010", routeShanghaiToPortKlang, 0.2,
    "2026-03-30T08:00:00", "2026-04-14T10:00:00", "en_transit", "Shanghai Silk Road Freight",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "28/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "29/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "en_attente", fournisseur: "Shanghai Silk Road Freight" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "28/03" },
    ],
    [
      { type: "retard", severite: "basse", message: "Départ décalé — congestion port de Shanghai", timestamp: "2026-03-30T06:00:00" },
    ]
  ),
];
