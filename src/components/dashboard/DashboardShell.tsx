"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRestaurant } from "@/context/restaurant-context";

const nav = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/restaurants", label: "Restaurantes" },
  { href: "/dashboard/stock", label: "Estoque" },
  { href: "/dashboard/purchases", label: "Compras" },
  { href: "/dashboard/recipes", label: "Receitas" },
  { href: "/dashboard/cash-flow", label: "Fluxo de Caixa" },
  { href: "/dashboard/cadastros", label: "Cadastros" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { token, isLoading, logout } = useAuth();
  const { currentRestaurant, restaurants, setCurrentRestaurant } = useRestaurant();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-pulse text-amber-600">Carregando...</div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen flex bg-stone-50">
      <aside className="w-64 bg-amber-900 text-amber-50 flex flex-col shrink-0">
        <div className="p-6 border-b border-amber-800">
          <h1 className="text-xl font-bold">PantryPro</h1>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg transition ${
                pathname === item.href
                  ? "bg-amber-800 text-white"
                  : "text-amber-100 hover:bg-amber-800/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-amber-800">
          {restaurants.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs text-amber-200 mb-1">
                Restaurante
              </label>
              <select
                value={currentRestaurant?.id ?? ""}
                onChange={(e) => {
                  const r = restaurants.find((x) => x.id === +e.target.value);
                  if (r) setCurrentRestaurant(r);
                }}
                className="w-full bg-amber-800 border border-amber-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fantasyName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-amber-200 hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
