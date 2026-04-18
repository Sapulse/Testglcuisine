"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  ShoppingCart,
  UserRound,
  Wrench,
  Search,
} from "lucide-react";

interface Item {
  id: string;
  type: "projet" | "sav" | "client" | "commande" | "navigation";
  label: string;
  description?: string;
  href: string;
}

export function RechercheGlobale({ items }: { items: Item[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  // Ouverture via Ctrl/Cmd+K (écran) ou bouton.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOuvert((v) => !v);
      }
      if (e.key === "Escape") setOuvert(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const groupes = useMemo(() => {
    const g: Record<Item["type"], Item[]> = {
      navigation: [],
      projet: [],
      sav: [],
      client: [],
      commande: [],
    };
    for (const it of items) g[it.type].push(it);
    return g;
  }, [items]);

  function onChoix(href: string) {
    setOuvert(false);
    setQ("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 print:hidden"
        title="Recherche globale (Ctrl+K)"
      >
        <Search className="h-3 w-3" />
        <span>Rechercher</span>
        <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-mono text-[10px] text-slate-600">
          Ctrl+K
        </kbd>
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[10vh]"
          onClick={() => setOuvert(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command shouldFilter className="flex flex-col">
              <div className="flex items-center border-b border-slate-200 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <Command.Input
                  value={q}
                  onValueChange={setQ}
                  placeholder="Rechercher projet, client, commande, SAV…"
                  className="flex-1 border-0 bg-transparent px-3 py-3 text-sm outline-none"
                  autoFocus
                />
                <kbd className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-500">
                  Esc
                </kbd>
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                  Aucun résultat.
                </Command.Empty>

                <Groupe titre="Navigation" icone={LayoutDashboard} items={groupes.navigation} onChoix={onChoix} />
                <Groupe titre="Projets" icone={FolderKanban} items={groupes.projet} onChoix={onChoix} />
                <Groupe titre="Clients" icone={UserRound} items={groupes.client} onChoix={onChoix} />
                <Groupe titre="Commandes" icone={ShoppingCart} items={groupes.commande} onChoix={onChoix} />
                <Groupe titre="SAV" icone={Wrench} items={groupes.sav} onChoix={onChoix} />
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}

function Groupe({
  titre,
  icone: Icone,
  items,
  onChoix,
}: {
  titre: string;
  icone: React.ComponentType<{ className?: string }>;
  items: Item[];
  onChoix: (href: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Command.Group
      heading={titre}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-500"
    >
      {items.map((it) => (
        <Command.Item
          key={it.id}
          value={`${it.label} ${it.description ?? ""}`}
          onSelect={() => onChoix(it.href)}
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm data-[selected=true]:bg-slate-100"
        >
          <Icone className="h-4 w-4 text-slate-500" />
          <span className="flex-1 truncate">{it.label}</span>
          {it.description && (
            <span className="truncate text-xs text-slate-500">{it.description}</span>
          )}
          <CalendarDays className="hidden" />
        </Command.Item>
      ))}
    </Command.Group>
  );
}
