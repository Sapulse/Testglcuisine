// Layout du groupe (dashboard) — sidebar + contenu. Complété au Sprint 1.
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen">{children}</div>;
}
