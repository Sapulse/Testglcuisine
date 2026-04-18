/**
 * Helpers de semaines ISO 8601.
 * Format métier : "S01" à "S53" (préfixe S + numéro sur 2 chiffres).
 */

/** Formate un numéro de semaine en label "S01" … "S53". */
export function formaterSemaine(numero: number): string {
  if (numero < 1 || numero > 53) {
    throw new Error(`Numéro de semaine invalide : ${numero}`);
  }
  return `S${numero.toString().padStart(2, "0")}`;
}

/** Parse un label "S16" → 16. Rejette tout ce qui ne respecte pas le format. */
export function parserSemaine(label: string): number {
  const match = /^S(\d{2})$/.exec(label);
  if (!match) throw new Error(`Label semaine invalide : ${label}`);
  const n = Number(match[1]);
  if (n < 1 || n > 53) throw new Error(`Numéro hors plage : ${label}`);
  return n;
}

/** Renvoie le numéro de semaine ISO 8601 pour une date. */
function numeroSemaineIso(date: Date): number {
  // Copie en UTC pour neutraliser les fuseaux / DST.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Jeudi de la semaine ISO — l'année ISO s'aligne sur ce jeudi.
  const dayNum = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Renvoie l'année ISO 8601 correspondant à la date (peut différer de l'année civile). */
function anneeIso(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/** Convertit une date en label semaine "S16". */
export function dateVersSemaine(date: Date): string {
  return formaterSemaine(numeroSemaineIso(date));
}

/** Convertit un label "S16" (+ année) en intervalle { debut: lundi, fin: dimanche }. */
export function semaineVersDates(
  semaine: string,
  annee: number,
): { debut: Date; fin: Date } {
  const numero = parserSemaine(semaine);
  // Méthode ISO : 4 janvier est toujours en semaine 1.
  const quatreJanvier = new Date(Date.UTC(annee, 0, 4));
  const dayOfWeek = quatreJanvier.getUTCDay() === 0 ? 7 : quatreJanvier.getUTCDay();
  const lundiSemaine1 = new Date(quatreJanvier);
  lundiSemaine1.setUTCDate(quatreJanvier.getUTCDate() - (dayOfWeek - 1));

  const debut = new Date(lundiSemaine1);
  debut.setUTCDate(lundiSemaine1.getUTCDate() + (numero - 1) * 7);
  const fin = new Date(debut);
  fin.setUTCDate(debut.getUTCDate() + 6);
  fin.setUTCHours(23, 59, 59, 999);
  return { debut, fin };
}

/** Semaine courante au format "S16" (utilise `Date.now()`, testable via maintenant). */
export function semaineActuelle(maintenant: Date = new Date()): string {
  return dateVersSemaine(maintenant);
}

/** Année ISO courante (ex. 2026). */
export function anneeActuelle(maintenant: Date = new Date()): number {
  return anneeIso(maintenant);
}

/**
 * Nombre de jours calendaires entre aujourd'hui et le lundi de la semaine donnée.
 * Valeur négative si la semaine est déjà passée.
 */
export function joursAvantSemaine(
  semaine: string,
  annee: number,
  maintenant: Date = new Date(),
): number {
  const { debut } = semaineVersDates(semaine, annee);
  const debutJour = new Date(Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate(),
  ));
  const diffMs = debut.getTime() - debutJour.getTime();
  return Math.round(diffMs / 86_400_000);
}
