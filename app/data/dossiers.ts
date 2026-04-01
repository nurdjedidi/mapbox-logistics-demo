import type { Dossier } from "~/types";

export const ports = {
  tangerMed: { lat: 35.8917, lng: -5.4197, nom: "Tanger Med" },
  algeciras: { lat: 36.1408, lng: -5.4553, nom: "Algésiras" },
  marseille: { lat: 43.3047, lng: 5.3678, nom: "Marseille" },
  genes: { lat: 44.4056, lng: 8.9463, nom: "Gênes" },
  barcelona: { lat: 41.3518, lng: 2.1739, nom: "Barcelone" },
};

const GIBRALTAR: [number, number] = [-5.36, 35.98];
const ALBORAN_W: [number, number] = [-4.0, 36.2];
const ALBORAN_E: [number, number] = [0.2, 38.0];
const GULF_LION: [number, number] = [4.0, 42.8];
const LIGURIAN: [number, number] = [7.5, 43.5];

const routes = {
  toAlgeciras: [
    [-5.4197, 35.8917] as [number, number],
    [-5.37, 35.96] as [number, number],
    [-5.4553, 36.1408] as [number, number],
  ],
  toBarcelona: [
    [-5.4197, 35.8917] as [number, number],
    GIBRALTAR,
    ALBORAN_W,
    ALBORAN_E,
    [2.1739, 41.3518] as [number, number],
  ],
  toMarseille: [
    [-5.4197, 35.8917] as [number, number],
    GIBRALTAR,
    ALBORAN_W,
    ALBORAN_E,
    GULF_LION,
    [5.3678, 43.3047] as [number, number],
  ],
  toGenes: [
    [-5.4197, 35.8917] as [number, number],
    GIBRALTAR,
    ALBORAN_W,
    ALBORAN_E,
    GULF_LION,
    LIGURIAN,
    [8.9463, 44.4056] as [number, number],
  ],
};

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

export function splitRouteAtProgress(
  route: [number, number][],
  t: number
): { completed: [number, number][]; remaining: [number, number][] } {
  if (t <= 0) return { completed: [route[0]], remaining: route };
  if (t >= 1) return { completed: route, remaining: [route[route.length - 1]] };

  const lengths = route.slice(0, -1).map((p, i) => segLen(p, route[i + 1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  let remaining = t * total;

  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const s = remaining / lengths[i];
      const splitPt: [number, number] = [
        route[i][0] + (route[i + 1][0] - route[i][0]) * s,
        route[i][1] + (route[i + 1][1] - route[i][1]) * s,
      ];
      return {
        completed: [...route.slice(0, i + 1), splitPt],
        remaining: [splitPt, ...route.slice(i + 1)],
      };
    }
    remaining -= lengths[i];
  }

  return { completed: route, remaining: [route[route.length - 1]] };
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
  const origine = ports[
    Object.keys(ports).find(
      (k) =>
        Math.abs(ports[k as keyof typeof ports].lng - route[0][0]) < 0.01 &&
        Math.abs(ports[k as keyof typeof ports].lat - route[0][1]) < 0.01
    ) as keyof typeof ports
  ] ?? { lng: route[0][0], lat: route[0][1], nom: "Tanger Med" };

  const dest = ports[
    Object.keys(ports).find(
      (k) =>
        Math.abs(ports[k as keyof typeof ports].lng - route[route.length - 1][0]) < 0.01 &&
        Math.abs(ports[k as keyof typeof ports].lat - route[route.length - 1][1]) < 0.01
    ) as keyof typeof ports
  ] ?? { lng: route[route.length - 1][0], lat: route[route.length - 1][1], nom: "?" };

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

export const dossiers: Dossier[] = [
  mk(
    "REF-2024-001", "MSCU1234567", routes.toMarseille, 0.6,
    "2024-03-28T08:00:00", "2024-04-02T14:00:00", "en_transit", "Atlas Import SARL",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "25/03", fournisseur: "Atlas Import SARL" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "26/03" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "Atlas Import SARL", derniereRelance: "30/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "28/03" },
      { type: "packing_list", libelle: "Packing List", statut: "en_attente", fournisseur: "Atlas Import SARL" },
    ],
    [
      { type: "docs_manquants", severite: "haute", message: "EUR1 manquant — dédouanement bloqué", timestamp: "2024-03-30T10:00:00" },
      { type: "surestaries", severite: "haute", message: "Surestaries J-3 : EUR1 toujours manquant", timestamp: "2024-03-30T10:00:00" },
    ]
  ),
  mk(
    "REF-2024-002", "CMAU8765432", routes.toGenes, 0.45,
    "2024-03-27T06:00:00", "2024-04-03T09:00:00", "en_transit", "MedCargo SA",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "24/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "25/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "26/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "27/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "24/03" },
    ],
    []
  ),
  mk(
    "REF-2024-003", "EVRU3456789", routes.toMarseille, 1,
    "2024-03-25T10:00:00", "2024-03-31T16:00:00", "au_port", "SotraMed",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "22/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "en_attente", fournisseur: "SotraMed" },
      { type: "eur1", libelle: "EUR1", statut: "en_attente", fournisseur: "SotraMed" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "25/03" },
      { type: "cmr", libelle: "CMR", statut: "en_attente", fournisseur: "SotraMed" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port de Marseille", timestamp: "2024-03-31T14:30:00" },
      { type: "docs_manquants", severite: "haute", message: "3 documents en attente pour dédouanement", timestamp: "2024-03-31T14:30:00" },
    ]
  ),
  mk(
    "REF-2024-004", "HLXU5544332", routes.toAlgeciras, 0.8,
    "2024-03-30T07:00:00", "2024-03-31T11:00:00", "en_transit", "EuroTrade Maroc",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "28/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "EuroTrade Maroc" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "30/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "29/03" },
    ],
    [
      { type: "surestaries", severite: "haute", message: "Surestaries imminentes — arrivée J-1, certificat manquant", timestamp: "2024-03-30T09:00:00" },
    ]
  ),
  mk(
    "REF-2024-005", "OOLU9988776", routes.toBarcelona, 0.35,
    "2024-03-29T09:00:00", "2024-04-01T18:00:00", "en_transit", "IberCargo",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "27/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "28/03" },
      { type: "eur1", libelle: "EUR1", statut: "manquant", fournisseur: "IberCargo" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "29/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "27/03" },
    ],
    [
      { type: "docs_manquants", severite: "moyenne", message: "EUR1 manquant — relancer IberCargo", timestamp: "2024-03-30T08:00:00" },
    ]
  ),
  mk(
    "REF-2024-006", "APMU1122334", routes.toMarseille, 1,
    "2024-03-20T06:00:00", "2024-03-25T12:00:00", "dedouane", "ProximaShip",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "18/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "19/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "19/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "20/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "18/03" },
    ],
    []
  ),
  mk(
    "REF-2024-007", "ZIMU6677889", routes.toGenes, 0.25,
    "2024-03-26T11:00:00", "2024-04-04T08:00:00", "en_transit", "GenCargo Italia",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "24/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "25/03" },
      { type: "eur1", libelle: "EUR1", statut: "en_attente", fournisseur: "GenCargo Italia" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "26/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "24/03" },
    ],
    [
      { type: "retard", severite: "basse", message: "ETA décalé +24h suite conditions météo Golfe du Lion", timestamp: "2024-03-30T07:00:00" },
    ]
  ),
  mk(
    "REF-2024-008", "MSDU4433221", routes.toMarseille, 0.5,
    "2024-03-29T14:00:00", "2024-04-03T10:00:00", "en_transit", "FranceMed Logistics",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "27/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "28/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "28/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "29/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "27/03" },
    ],
    []
  ),
  mk(
    "REF-2024-009", "COSU7788990", routes.toAlgeciras, 1,
    "2024-03-31T05:00:00", "2024-03-31T09:00:00", "au_port", "AlgecirasTrade",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "manquant", fournisseur: "AlgecirasTrade" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "manquant", fournisseur: "AlgecirasTrade" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "31/03" },
      { type: "packing_list", libelle: "Packing List", statut: "en_attente", fournisseur: "AlgecirasTrade" },
    ],
    [
      { type: "geofencing", severite: "moyenne", message: "Conteneur entré en zone port d'Algésiras", timestamp: "2024-03-31T08:45:00" },
      { type: "docs_manquants", severite: "haute", message: "2 documents manquants — conteneur au port", timestamp: "2024-03-31T09:00:00" },
    ]
  ),
  mk(
    "REF-2024-010", "TEMU3344556", routes.toGenes, 0.15,
    "2024-03-30T08:00:00", "2024-04-05T16:00:00", "en_transit", "TritonShipping",
    [
      { type: "facture", libelle: "Facture commerciale", statut: "recu", dateReception: "28/03" },
      { type: "certificat_origine", libelle: "Certificat d'origine", statut: "recu", dateReception: "29/03" },
      { type: "eur1", libelle: "EUR1", statut: "recu", dateReception: "29/03" },
      { type: "bl", libelle: "Connaissement (B/L)", statut: "recu", dateReception: "30/03" },
      { type: "packing_list", libelle: "Packing List", statut: "recu", dateReception: "28/03" },
    ],
    []
  ),
];
