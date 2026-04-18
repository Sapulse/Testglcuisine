import { Sidebar } from "@/components/metier/Sidebar";

/** Layout : sidebar à gauche (desktop) / barre du haut (mobile). */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-auto bg-white">{children}</main>
    </div>
  );
}
