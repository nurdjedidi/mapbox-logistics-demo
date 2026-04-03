import type { Dossier } from "~/types";

export const portsComores = {
  moroni: { lat: -11.7036, lng: 43.2551, nom: "Moroni" },
  mutsamudu: { lat: -12.1696, lng: 44.2894, nom: "Mutsamudu" },
  marseille: { lat: 43.3047, lng: 5.3678, nom: "Marseille" },
  mumbai: { lat: 18.9398, lng: 72.8355, nom: "Mumbai" },
  darEsSalaam: { lat: -6.8235, lng: 39.2695, nom: "Dar es Salaam" },
};

const MORONI: [number, number] = [43.2551, -11.7036];
const MUTSAMUDU: [number, number] = [44.2894, -12.1696];
const MARSEILLE: [number, number] = [5.3678, 43.3047];
const MUMBAI: [number, number] = [72.8355, 18.9398];
const DAR_ES_SALAAM: [number, number] = [39.2695, -6.8235];

// Somali coast — stay well offshore east of Horn of Africa
const OFF_SOMALIA_S: [number, number] = [47.0, 0.0];
const OFF_SOMALIA_N: [number, number] = [51.5, 10.5];
const GULF_ADEN_E: [number, number] = [48.0, 12.2];
const GULF_ADEN_W: [number, number] = [44.5, 12.5];
const BAB_EL_MANDEB: [number, number] = [43.4, 12.5];

// Red Sea — follow the center channel, take Gulf of Suez (west fork) not Aqaba
const RED_SEA_S: [number, number] = [42.5, 14.8];
const RED_SEA_MID: [number, number] = [39.5, 19.0];
const RED_SEA_UPPER: [number, number] = [36.5, 24.0];
const GULF_SUEZ_S: [number, number] = [33.9, 27.6];
const SUEZ_CANAL_S: [number, number] = [32.56, 29.93];
const PORT_SAID: [number, number] = [32.31, 31.26];

// Mediterranean
const CRETE_S: [number, number] = [24.0, 34.5];
const MALTA: [number, number] = [14.5, 35.9];
const SARDINIA_S: [number, number] = [9.5, 38.5];
const GULF_LION: [number, number] = [4.0, 42.8];

// Arabian Sea toward India
const ARABIAN_SEA_W: [number, number] = [55.0, 13.0];
const ARABIAN_SEA_E: [number, number] = [63.0, 16.0];
const INDIA_APPROACH: [number, number] = [69.0, 17.5];

// Mozambique Channel (Comores → Dar es Salaam is short, stays in channel)
const MOZAMBIQUE_CH: [number, number] = [41.5, -8.5];

// Suez-bound routes via Gulf of Aden
const ADEN_TO_MED: [number, number][] = [
  OFF_SOMALIA_S, OFF_SOMALIA_N, GULF_ADEN_E, GULF_ADEN_W,
  BAB_EL_MANDEB, RED_SEA_S, RED_SEA_MID, RED_SEA_UPPER,
  GULF_SUEZ_S, SUEZ_CANAL_S, PORT_SAID, CRETE_S, MALTA, SARDINIA_S, GULF_LION,
];

const routesMoroniToMarseille: [number, number][] = [
  MORONI, ...ADEN_TO_MED, MARSEILLE,
];

const routesMutsamuduToMarseille: [number, number][] = [
  MUTSAMUDU, ...ADEN_TO_MED, MARSEILLE,
];

const routesMoroniToMumbai: [number, number][] = [
  MORONI, OFF_SOMALIA_S, OFF_SOMALIA_N, GULF_ADEN_E,
  ARABIAN_SEA_W, ARABIAN_SEA_E, INDIA_APPROACH, MUMBAI,
];

const routesMutsamuduToMumbai: [number, number][] = [
  MUTSAMUDU, OFF_SOMALIA_S, OFF_SOMALIA_N, GULF_ADEN_E,
  ARABIAN_SEA_W, ARABIAN_SEA_E, INDIA_APPROACH, MUMBAI,
];

const routesMoroniToDar: [number, number][] = [
  MORONI, MOZAMBIQUE_CH, DAR_ES_SALAAM,
];

const routesMutsamuduToDar: [number, number][] = [
  MUTSAMUDU, MOZAMBIQUE_CH, DAR_ES_SALAAM,
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

const allPorts = portsComores;

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
  const origine = Object.values(allPorts).find(
    (p) => Math.abs(p.lng - route[0][0]) < 0.05 && Math.abs(p.lat - route[0][1]) < 0.05
  ) ?? { lng: route[0][0], lat: route[0][1], nom: "?" };

  const dest = Object.values(allPorts).find(
    (p) => Math.abs(p.lng - route[route.length - 1][0]) < 0.05 && Math.abs(p.lat - route[route.length - 1][1]) < 0.05
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

export const dossiersComores: Dossier[] = [
  mk(
    "KM-2026-001", "MSCU2241001", routesMoroniToMarseille, 0.55,
    "2026-03-18T06:00:00", "2026-04-08T14:00:00", "en_transit", "Comores Export SARL",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "15/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "16/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "18/03" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Comores Export SARL", derniereRelance: "28/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "15/03" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — dédouanement Marseille bloqué", timestamp: "2026-03-30T10:00:00" },
      { type: "surestaries", severite: "haute", message: "Surestaries J-8 si EUR1 non reçu", timestamp: "2026-03-30T10:00:00" },
    ]
  ),
  mk(
    "KM-2026-002", "CMAU3352002", routesMoroniToMumbai, 0.4,
    "2026-03-22T09:00:00", "2026-04-05T12:00:00", "en_transit", "Vanille des Iles",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "20/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "21/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "22/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "20/03" },
    ],
    []
  ),
  mk(
    "KM-2026-003", "EVRU4463003", routesMoroniToDar, 0.7,
    "2026-03-28T07:00:00", "2026-04-01T16:00:00", "en_transit", "Swahili Freight",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "26/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "en_attente", fournisseur: "Swahili Freight" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "28/03" },
      { type: "packing_list", libelle: "Packing List", statut: "en_attente", fournisseur: "Swahili Freight" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "Certificat d'origine en attente — relancer Swahili Freight", timestamp: "2026-03-30T08:00:00" },
    ]
  ),
  mk(
    "KM-2026-004", "HLXU5574004", routesMutsamuduToMarseille, 0.3,
    "2026-03-25T10:00:00", "2026-04-12T09:00:00", "en_transit", "Anjouanaise de Commerce",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "23/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "24/03" },
      { type: "eur1", libelle: "EUR1", statut: "en_attente", fournisseur: "Anjouanaise de Commerce" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "25/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "23/03" },
    ],
    [
      { type: "retard", severite: "basse", message: "ETA décalé +12h — congestion canal de Suez", timestamp: "2026-03-30T07:00:00" },
    ]
  ),
  mk(
    "KM-2026-005", "OOLU6685005", routesMutsamuduToMumbai, 0.65,
    "2026-03-20T08:00:00", "2026-04-02T18:00:00", "en_transit", "Ocean Ylang Trading",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "18/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "19/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "20/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "18/03" },
    ],
    []
  ),
  mk(
    "KM-2026-006", "APMU7796006", routesMoroniToMarseille, 1,
    "2026-03-10T06:00:00", "2026-03-28T12:00:00", "au_port", "Ngazidja Spices",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "08/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "09/03" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Ngazidja Spices", derniereRelance: "26/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "10/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "08/03" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port de Marseille", timestamp: "2026-03-28T11:00:00" },
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — conteneur bloqué à Marseille", timestamp: "2026-03-28T12:00:00" },
    ]
  ),
  mk(
    "KM-2026-007", "ZIMU8807007", routesMutsamuduToDar, 1,
    "2026-03-26T05:00:00", "2026-03-30T09:00:00", "dedouane", "Tanzanian Link Co",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "24/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "25/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "26/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "24/03" },
    ],
    []
  ),
  mk(
    "KM-2026-008", "MSDU9918008", routesMoroniToMumbai, 0.15,
    "2026-03-30T14:00:00", "2026-04-14T10:00:00", "en_transit", "Comorienne d'Import-Export",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "28/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "Comorienne d'Import-Export" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "en_attente", fournisseur: "Comorienne d'Import-Export" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "28/03" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "Certificat d'origine manquant + B/L en attente", timestamp: "2026-03-31T08:00:00" },
    ]
  ),
  mk(
    "KM-2026-009", "COSU1029009", routesMoroniToDar, 1,
    "2026-03-24T06:00:00", "2026-03-28T14:00:00", "au_port", "DarPort Logistics",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "22/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "en_attente", fournisseur: "DarPort Logistics" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "24/03" },
      { type: "packing_list", libelle: "Packing List", statut: "en_attente", fournisseur: "DarPort Logistics" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port de Dar es Salaam", timestamp: "2026-03-28T13:30:00" },
      { type: "docs_manquants", severite: "haute", message: "2 documents en attente — dédouanement retardé", timestamp: "2026-03-28T14:00:00" },
    ]
  ),
  mk(
    "KM-2026-010", "TEMU2130010", routesMutsamuduToMarseille, 0.75,
    "2026-03-15T08:00:00", "2026-04-04T16:00:00", "en_transit", "Mayotte Transit Express",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "13/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "14/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "14/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "15/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "13/03" },
    ],
    []
  ),
];
