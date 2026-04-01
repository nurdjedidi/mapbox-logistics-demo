# Context Dashboard Transit Maritime - Othmane Ouldaraba

## Objectif
Maquette dashboard pour commissionnaire en douane / transitaire international.
**Call prévu semaine prochaine** — besoin démo fonctionnelle pour montrer la valeur.

---

## Pain Points Client (Othmane - 40 dossiers/mois)

**Problèmes identifiés (par ordre d'impact) :**
1. **Tracking conteneurs/camions** — durée brute importante, perte de vue = surestaries
2. **Documents douaniers** — lourd mentalement, docs manquants bloquent dédouanement
3. **Communication fournisseurs** — interruptions constantes, relances chronophages

**Solution proposée :**
Dashboard type "FlightRadar maritime" avec :
- Tracking temps réel multi-modal (maritime priorité, routier, éventuellement aérien)
- Geofencing ports → alertes automatiques arrivée conteneur
- Checklist douane par dossier + relance fournisseurs 1-clic (email/WhatsApp)

---

## Specs Techniques

### Stack
- **React 19** + TypeScript + Vite
- **Mapbox GL JS** (Standard style `mapbox://styles/mapbox/navigation-night-v1`)
  - Pitch 45-60° pour vue 3D navigation
  - Dynamic lighting (dawn/day/dusk/night)
  - 3D buildings + landmarks activés
  - Renommer Israel en Palestine
  - worldview baser sur le Maroc
- **Tailwind v4** (pas de `---` separators, design sobre pas AI-like)
- **Framer Motion** pour animations fluides
- **shadcn/ui** pour composants UI (pas de emojis)

### Données Simulées
**40 dossiers fictifs** représentant le volume mensuel réel :
- 30 conteneurs maritimes (priorité)
- 8 camions routiers
- 2 cargaisons aériennes (optionnel)

**Ports/Routes réalistes :**
- Tanger Med (Maroc) → hub principal
- Algésiras (Espagne), Marseille (France), Gênes (Italie)
- Routes terrestres : Tanger → Casablanca, Tanger → Rabat

**Statuts docs douane** (par dossier) :
- ✓ Reçu (vert)
- ⏳ En attente (orange)
- ⚠️ Manquant (rouge)

**Types documents :**
- Facture commerciale
- Certificat d'origine
- EUR1 (préférence tarifaire EU)
- CMR (transport routier)
- Connaissement (B/L maritime)
- Packing list

---

## Architecture UI

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│ Header : Logo · 40 Dossiers Actifs · 12 Alertes · User     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│              CARTE MAPBOX 3D CENTRALE                       │
│         (Conteneurs · Trajectoires · Ports)                 │
│                                                             │
│                                                             │
├─────────────────────┬───────────────────────────────────────┤
│ PANNEAU GAUCHE      │ PANNEAU DROIT                         │
│ Dossiers Actifs     │ Détails Dossier Sélectionné           │
│ (Liste scrollable)  │ · Infos conteneur/camion              │
│                     │ · Checklist douane                    │
│ [Filtres]           │ · Bouton relance fournisseur          │
│ · Tous              │ · Timeline événements                 │
│ · Maritime          │                                       │
│ · Routier           │                                       │
│ · Aérien            │                                       │
│ · Alertes only      │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

### Composants Clés

**1. Carte 3D Interactive**
- Markers 3D pour conteneurs/camions (icônes selon type transport)
- Trajectoires animées (lignes avec gradient)
- Geofencing visuel (cercles semi-transparents autour ports)
- Popup au clic → infos rapides + bouton "Voir détails"

**2. Liste Dossiers (Panneau Gauche)**
Chaque item :
```
[Icône transport] REF-2024-001 
Tanger Med → Marseille
ETA: 2 avril 14:00
🔴 2 docs manquants
```

**3. Détails Dossier (Panneau Droit)**
```
CONTENEUR MSCU1234567
Route: Tanger Med → Marseille
Départ: 28 mars 08:00
ETA: 2 avril 14:00
Statut: En transit (320 km de Marseille)

DOCUMENTS DOUANE
✓ Facture commerciale (reçue 25/03)
✓ Certificat origine (reçu 26/03)
⚠️ EUR1 (manquant - fournisseur relancé 30/03)
⏳ CMR (en attente transporteur)

[Bouton] Relancer fournisseur EUR1
```

**4. Module Alertes**
Priorités :
- 🔴 Surestaries J-3 (conteneur arrive dans 3j, docs manquants)
- 🟠 Geofencing (conteneur entré zone port)
- 🟡 Retard prévisionnel (ETA décalé +24h)

---

## Interactions Utilisateur

**Scénarios à démontrer au call :**

1. **Vue d'ensemble** → 40 dossiers sur la carte, code couleur selon statut
2. **Drill-down** → clic sur conteneur → panneau détails s'ouvre avec checklist douane
3. **Alerte geofencing** → animation quand conteneur entre dans rayon port (popup + son optionnel)
4. **Relance 1-clic** → bouton "Relancer fournisseur" → modal avec template email pré-rempli + copie WhatsApp

---

## Style Visuel

**Palette couleurs** (pas de emojis, design sobre) :
- Fond : dark mode (#0f172a slate-900) ou light mode selon préférence
- Accents : bleu marine (#1e40af) pour maritime, vert (#059669) pour OK, rouge (#dc2626) pour alertes
- Glassmorphism pour panneaux latéraux (backdrop-blur)

**Typographie :**
- Titres : font-bold sans-serif
- Corps : font-normal
- Monospace pour références dossiers (REF-2024-001)

**Animations :**
- Framer Motion pour transitions panneaux
- Trajectoires conteneurs animées (tirets qui se déplacent sur la ligne)
- Pulse subtil sur markers alertes

---

## Données Mock

### Exemple Dossier
```typescript
interface Dossier {
  id: string; // "REF-2024-001"
  type: "maritime" | "routier" | "aerien";
  vehiculeId: string; // "MSCU1234567" (conteneur) ou "34-ABC-123" (camion)
  origine: { lat: number; lng: number; nom: string };
  destination: { lat: number; lng: number; nom: string };
  depart: Date;
  eta: Date;
  positionActuelle: { lat: number; lng: number };
  statut: "en_transit" | "au_port" | "dedouane" | "livre";
  documents: Document[];
  alertes: Alerte[];
}

interface Document {
  type: "facture" | "certificat_origine" | "eur1" | "cmr" | "bl" | "packing_list";
  statut: "recu" | "en_attente" | "manquant";
  dateReception?: Date;
  fournisseur?: string;
  derniereRelance?: Date;
}

interface Alerte {
  type: "surestaries" | "geofencing" | "retard" | "docs_manquants";
  severite: "haute" | "moyenne" | "basse";
  message: string;
  timestamp: Date;
}
```

### Ports Majeurs (coords réelles)
```typescript
const ports = {
  tangerMed: { lat: 35.8917, lng: -5.4197, nom: "Tanger Med" },
  algeciras: { lat: 36.1408, lng: -5.4553, nom: "Algésiras" },
  marseille: { lat: 43.3047, lng: 5.3678, nom: "Marseille" },
  genes: { lat: 44.4056, lng: 8.9463, nom: "Gênes" },
  barcelona: { lat: 41.3518, lng: 2.1739, nom: "Barcelone" }
};
```

---

## Ordre de Build

**Phase 1 (minimal viable demo) :**
1. Setup React + Mapbox avec style Standard 3D
2. 10 dossiers maritimes simulés (Tanger → Marseille/Gênes)
3. Markers sur carte + trajectoires basiques
4. Panneau gauche liste dossiers (sans filtres)
5. Panneau droit détails statiques (hardcodé pour 1 dossier)

**Phase 2 (si temps) :**
6. Checklist douane interactive (statuts réels)
7. Geofencing visuel + alerte popup
8. Filtres panneau gauche
9. Animations Framer Motion
10. Modal relance fournisseur

**Phase 3 (polish) :**
11. 40 dossiers complets (maritime + routier + aérien)
12. Dynamic lighting Mapbox (bouton day/night)
13. Responsive mobile
14. Export PDF rapport dossier

---

## Contraintes

- **Pas de backend réel** → données mock en JSON local
- **Pas d'API tracking live** → positions simulées avec interpolation linéaire
- **Pas d'envoi email/WhatsApp réel** → juste copie template dans clipboard
- **Focus démo visuelle** → l'objectif est de montrer la valeur, pas un produit fini

---

## Questions à Poser au Call

1. **Périmètre transport** → Aérien pertinent ou juste maritime + routier ?
2. **Volume aérien vs maritime** → Sur 40 dossiers, combien de chaque ?
3. **Ports principaux** → Toujours Tanger Med ou aussi Casablanca/Agadir ?
4. **Docs douane prioritaires** → EUR1 systématique ou seulement export EU ?
5. **Communication fournisseurs** → Email suffit ou WhatsApp Business obligatoire ?
6. **Équipe** → Dashboard solo (Othmane) ou multi-users (son équipe) ?

---

## Pricing Indicatif (à discuter après démo)

**MVP fonctionnel** (2-3 semaines dev) :
- Tracking temps réel 3 transports
- Checklist douane + relances
- Dashboard admin
- Prix : 8 000 - 12 000 €

**Version SaaS complète** (2-3 mois) :
- Intégration API tracking réelles (MarineTraffic, Shippeo)
- Multi-tenancy (plusieurs transitaires)
- Mobile app
- Prix : 25 000 - 40 000 € + abonnement mensuel

**TJM alternatif** : 600 €/jour (si Othmane préfère facturation au temps)

---

## Notes Stratégiques

**Positioning :** 
- Pas un "site web", c'est un **outil métier spécialisé**
- Argument ROI : sur 40 dossiers/mois, éviter 1 seule surestarie (500-2000€) rembourse l'outil en 6 mois
- Différenciation : dashboards génériques (Shippeo, Flexport) sont trop chers pour PME — toi tu fais du **sur-mesure accessible**

**Risques :**
- Othmane peut dire "intéressant mais pas maintenant" → récupérer 3-5 autres contacts similaires AVANT le call
- Peut demander version "gratuite" pour tester → ne pas céder, proposer démo live étendue à la place

**Opportunités :**
- Si Othmane valide, demander intro 2-3 confrères transitaires
- Recycler la maquette pour prospection autres commissionnaires douane Maroc/France/Algérie
- Ajouter la démo au portfolio demo.nurdjedidi.com (version publique avec données fake)