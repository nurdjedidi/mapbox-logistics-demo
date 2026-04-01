export type TransportType = "maritime" | "routier" | "aerien";
export type DossierStatut = "en_transit" | "au_port" | "dedouane" | "livre";
export type DocumentType = "facture" | "certificat_origine" | "eur1" | "cmr" | "bl" | "packing_list";
export type DocumentStatut = "recu" | "en_attente" | "manquant";
export type AlerteType = "surestaries" | "geofencing" | "retard" | "docs_manquants";
export type AlerteSeverite = "haute" | "moyenne" | "basse";

export interface Port {
  lat: number;
  lng: number;
  nom: string;
}

export interface DocDouane {
  type: DocumentType;
  libelle: string;
  statut: DocumentStatut;
  dateReception?: string;
  fournisseur?: string;
  derniereRelance?: string;
}

export interface Alerte {
  type: AlerteType;
  severite: AlerteSeverite;
  message: string;
  timestamp: string;
}

export interface Dossier {
  id: string;
  type: TransportType;
  vehiculeId: string;
  origine: Port;
  destination: Port;
  depart: string;
  eta: string;
  route: [number, number][];
  progress: number;
  positionActuelle: { lat: number; lng: number };
  statut: DossierStatut;
  documents: DocDouane[];
  alertes: Alerte[];
  fournisseur: string;
}
