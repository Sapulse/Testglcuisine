/**
 * Store client-side persistant (localStorage) pour le mode démo statique.
 * Permet à la démo GitHub Pages d'avoir des CRUD réels (par navigateur).
 *
 * Structure : copie complète du snapshot, stocké en JSON.
 * Toute mutation appelle save() qui :
 * 1. Met à jour localStorage
 * 2. Notifie les abonnés (event "gl-store-update")
 */
import * as S from "./snapshot";

export interface SnapshotData {
  clients: S.SnapshotClient[];
  projets: S.SnapshotProjet[];
  etapes: S.SnapshotEtape[];
  commandes: S.SnapshotCommande[];
  fournisseurs: S.SnapshotFournisseur[];
  poseurs: S.SnapshotPoseur[];
  vendeurs: S.SnapshotVendeur[];
  assignations: S.SnapshotAssignation[];
  savs: S.SnapshotSAV[];
  savJournals: S.SnapshotSAVJournal[];
}

const KEY = "gl-cuisines-store-v1";
const EVENT = "gl-store-update";

/** Données par défaut depuis le snapshot. */
function defaults(): SnapshotData {
  return {
    clients: structuredClone(S.CLIENTS),
    projets: structuredClone(S.PROJETS),
    etapes: structuredClone(S.ETAPES),
    commandes: structuredClone(S.COMMANDES),
    fournisseurs: structuredClone(S.FOURNISSEURS),
    poseurs: structuredClone(S.POSEURS),
    vendeurs: structuredClone(S.VENDEURS),
    assignations: structuredClone(S.ASSIGNATIONS),
    savs: structuredClone(S.SAVS),
    savJournals: structuredClone(S.SAV_JOURNAUX),
  };
}

/** Désérialise un payload JSON brut → recrée les Date à partir des strings. */
function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return value;
}

/** Lit le store depuis localStorage. Renvoie les defaults si vide ou côté serveur. */
export function loadStore(): SnapshotData {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults();
    return JSON.parse(raw, reviver) as SnapshotData;
  } catch {
    return defaults();
  }
}

/** Persiste le store dans localStorage et notifie les abonnés. */
export function saveStore(data: SnapshotData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

/** Réinitialise le store aux valeurs du snapshot. */
export function resetStore(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Génère un id unique au format snapshot (préfixe court). */
export function makeId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Mute le store via une fonction et persiste. Retourne le résultat éventuel. */
export function mutate<T>(fn: (s: SnapshotData) => T): T {
  const s = loadStore();
  const r = fn(s);
  saveStore(s);
  return r;
}

/** Permet à React de s'abonner aux changements (pattern useSyncExternalStore). */
export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Snapshot courant (pour useSyncExternalStore). */
export function getSnapshot(): SnapshotData {
  return loadStore();
}

/** Snapshot serveur (toujours les defaults pour SSR). */
export function getServerSnapshot(): SnapshotData {
  return defaults();
}

// ─────────────── Helpers métier (CRUD compatibles snapshot) ───────────────

const NOMS_ETAPES = [
  "Bon de commande",
  "Plans techniques",
  "Plans de pose",
  "Commandes passées",
  "Livraisons reçues",
  "Dépose",
  "Prépa électrique",
  "Pose",
  "Facturation",
];

export function ajouterClient(input: Omit<S.SnapshotClient, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const c: S.SnapshotClient = {
      ...input,
      id: makeId("c"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.clients.push(c);
    return c;
  });
}

export function modifierClient(id: string, input: Partial<S.SnapshotClient>) {
  return mutate((s) => {
    const idx = s.clients.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Client introuvable");
    s.clients[idx] = { ...s.clients[idx], ...input, updatedAt: new Date() };
    return s.clients[idx];
  });
}

export function supprimerClientStore(id: string) {
  return mutate((s) => {
    if (s.projets.some((p) => p.clientId === id)) {
      throw new Error("Client lié à des projets");
    }
    s.clients = s.clients.filter((c) => c.id !== id);
  });
}

export function ajouterProjet(
  base: Omit<S.SnapshotProjet, "id" | "createdAt" | "updatedAt" | "dateCreation">,
): S.SnapshotProjet {
  return mutate((s) => {
    const projetId = makeId("p");
    const projet: S.SnapshotProjet = {
      ...base,
      id: projetId,
      dateCreation: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.projets.push(projet);
    // Crée les 9 étapes automatiquement
    NOMS_ETAPES.forEach((nom, i) => {
      s.etapes.push({
        id: makeId("e"),
        projetId,
        numero: i + 1,
        nom,
        statut: "non_commence",
        dateFin: null,
        commentaire: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return projet;
  });
}

export function modifierProjetStore(id: string, patch: Partial<S.SnapshotProjet>) {
  return mutate((s) => {
    const idx = s.projets.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Projet introuvable");
    s.projets[idx] = { ...s.projets[idx], ...patch, updatedAt: new Date() };
    return s.projets[idx];
  });
}

export function supprimerProjetStore(id: string) {
  return mutate((s) => {
    s.projets = s.projets.filter((p) => p.id !== id);
    s.etapes = s.etapes.filter((e) => e.projetId !== id);
    s.commandes = s.commandes.filter((c) => c.projetId !== id);
    s.assignations = s.assignations.filter((a) => a.projetId !== id);
    const savIds = s.savs.filter((sv) => sv.projetId === id).map((sv) => sv.id);
    s.savs = s.savs.filter((sv) => sv.projetId !== id);
    s.savJournals = s.savJournals.filter((j) => !savIds.includes(j.savId));
  });
}

export function dupliquerProjetStore(id: string): S.SnapshotProjet | null {
  let nouveau: S.SnapshotProjet | null = null;
  mutate((s) => {
    const source = s.projets.find((p) => p.id === id);
    if (!source) return;
    const cmds = s.commandes.filter((c) => c.projetId === id);
    const suffixe = Date.now().toString(36).slice(-4).toUpperCase();
    const nId = makeId("p");
    nouveau = {
      ...source,
      id: nId,
      reference: `${source.reference}-C${suffixe}`,
      dateCreation: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.projets.push(nouveau);
    NOMS_ETAPES.forEach((nom, i) => {
      s.etapes.push({
        id: makeId("e"),
        projetId: nId,
        numero: i + 1,
        nom,
        statut: "non_commence",
        dateFin: null,
        commentaire: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    cmds.forEach((c) => {
      s.commandes.push({
        ...c,
        id: makeId("cmd"),
        projetId: nId,
        statutCommande: "non_envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });
  return nouveau;
}

export function modifierEtapeStore(
  etapeId: string,
  patch: Partial<S.SnapshotEtape>,
) {
  return mutate((s) => {
    const idx = s.etapes.findIndex((e) => e.id === etapeId);
    if (idx === -1) throw new Error("Étape introuvable");
    const dateFin = patch.statut === "termine" ? new Date() : null;
    s.etapes[idx] = { ...s.etapes[idx], ...patch, dateFin, updatedAt: new Date() };
  });
}

export function ajouterCommande(input: Omit<S.SnapshotCommande, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const c: S.SnapshotCommande = {
      ...input,
      id: makeId("cmd"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.commandes.push(c);
    return c;
  });
}

export function modifierCommandeStore(id: string, patch: Partial<S.SnapshotCommande>) {
  return mutate((s) => {
    const idx = s.commandes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Commande introuvable");
    s.commandes[idx] = { ...s.commandes[idx], ...patch, updatedAt: new Date() };
  });
}

export function supprimerCommandeStore(id: string) {
  return mutate((s) => {
    s.commandes = s.commandes.filter((c) => c.id !== id);
  });
}

export function ajouterFournisseur(input: Omit<S.SnapshotFournisseur, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const f: S.SnapshotFournisseur = {
      ...input,
      id: makeId("f"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.fournisseurs.push(f);
    return f;
  });
}
export function modifierFournisseurStore(id: string, patch: Partial<S.SnapshotFournisseur>) {
  return mutate((s) => {
    const idx = s.fournisseurs.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("Fournisseur introuvable");
    s.fournisseurs[idx] = { ...s.fournisseurs[idx], ...patch, updatedAt: new Date() };
  });
}
export function supprimerFournisseurStore(id: string) {
  return mutate((s) => {
    if (s.commandes.some((c) => c.fournisseurId === id) || s.savs.some((sv) => sv.fournisseurId === id)) {
      throw new Error("Fournisseur lié à des commandes ou SAV");
    }
    s.fournisseurs = s.fournisseurs.filter((f) => f.id !== id);
  });
}

export function ajouterPoseur(input: Omit<S.SnapshotPoseur, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const p: S.SnapshotPoseur = {
      ...input,
      id: makeId("po"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.poseurs.push(p);
    return p;
  });
}
export function modifierPoseurStore(id: string, patch: Partial<S.SnapshotPoseur>) {
  return mutate((s) => {
    const idx = s.poseurs.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Poseur introuvable");
    s.poseurs[idx] = { ...s.poseurs[idx], ...patch, updatedAt: new Date() };
  });
}
export function supprimerPoseurStore(id: string) {
  return mutate((s) => {
    if (s.assignations.some((a) => a.poseurId === id)) {
      throw new Error("Poseur lié à des assignations");
    }
    s.poseurs = s.poseurs.filter((p) => p.id !== id);
  });
}

export function ajouterVendeur(input: Omit<S.SnapshotVendeur, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const v: S.SnapshotVendeur = {
      ...input,
      id: makeId("v"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.vendeurs.push(v);
    return v;
  });
}
export function modifierVendeurStore(id: string, patch: Partial<S.SnapshotVendeur>) {
  return mutate((s) => {
    const idx = s.vendeurs.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Vendeur introuvable");
    s.vendeurs[idx] = { ...s.vendeurs[idx], ...patch, updatedAt: new Date() };
  });
}
export function supprimerVendeurStore(id: string) {
  return mutate((s) => {
    s.vendeurs = s.vendeurs.filter((v) => v.id !== id);
  });
}

export function ajouterAssignation(input: Omit<S.SnapshotAssignation, "id" | "createdAt" | "updatedAt">) {
  return mutate((s) => {
    const a: S.SnapshotAssignation = {
      ...input,
      id: makeId("as"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.assignations.push(a);
  });
}
export function supprimerAssignationStore(id: string) {
  return mutate((s) => {
    s.assignations = s.assignations.filter((a) => a.id !== id);
  });
}

export function ajouterSav(
  input: Omit<S.SnapshotSAV, "id" | "createdAt" | "updatedAt">,
  premiereLigne: string,
): S.SnapshotSAV {
  return mutate((s) => {
    const sav: S.SnapshotSAV = {
      ...input,
      id: makeId("sav"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    s.savs.push(sav);
    s.savJournals.push({
      id: makeId("jrn"),
      savId: sav.id,
      type: "creation",
      auteur: null,
      commentaire: premiereLigne,
      horodatage: new Date(),
      createdAt: new Date(),
    });
    return sav;
  });
}
export function modifierSavStore(id: string, patch: Partial<S.SnapshotSAV>) {
  let avant: S.SnapshotSAV | undefined;
  mutate((s) => {
    const idx = s.savs.findIndex((sv) => sv.id === id);
    if (idx === -1) throw new Error("SAV introuvable");
    avant = { ...s.savs[idx] };
    s.savs[idx] = { ...s.savs[idx], ...patch, updatedAt: new Date() };
    if (patch.statut && patch.statut !== avant.statut) {
      s.savJournals.push({
        id: makeId("jrn"),
        savId: id,
        type: patch.statut === "clos" ? "cloture" : "changement_statut",
        auteur: null,
        commentaire: `Statut : ${avant.statut} → ${patch.statut}`,
        horodatage: new Date(),
        createdAt: new Date(),
      });
    }
  });
}
export function supprimerSavStore(id: string) {
  mutate((s) => {
    s.savs = s.savs.filter((sv) => sv.id !== id);
    s.savJournals = s.savJournals.filter((j) => j.savId !== id);
  });
}
export function ajouterJournalSav(
  savId: string,
  type: S.SnapshotSAVJournal["type"],
  commentaire: string,
  auteur: string | null,
) {
  mutate((s) => {
    s.savJournals.push({
      id: makeId("jrn"),
      savId,
      type,
      auteur,
      commentaire,
      horodatage: new Date(),
      createdAt: new Date(),
    });
  });
}

export function enregistrerNotesStore(projetId: string, notes: string) {
  mutate((s) => {
    const idx = s.projets.findIndex((p) => p.id === projetId);
    if (idx === -1) throw new Error("Projet introuvable");
    s.projets[idx] = { ...s.projets[idx], notes: notes.trim() || null, updatedAt: new Date() };
  });
}
