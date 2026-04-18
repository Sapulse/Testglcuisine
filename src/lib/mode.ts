/**
 * Détecte si l'app tourne en mode "démo statique" (GitHub Pages).
 * Exporté pour usage client ET serveur (variable NEXT_PUBLIC_).
 */
export function estDemoStatique(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_DEMO === "1";
}
