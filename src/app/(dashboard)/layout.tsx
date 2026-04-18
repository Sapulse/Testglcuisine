import { Sidebar } from "@/components/metier/Sidebar";

/** Layout avec sidebar permanente à gauche + zone de contenu. */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-auto bg-white">{children}</main>
    </div>
  );
}
