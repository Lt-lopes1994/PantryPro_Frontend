"use client";

import Link from "next/link";
import { useRestaurant } from "@/context/restaurant-context";

export function DashboardHome() {
  const { currentRestaurant } = useRestaurant();

  return (
    <>
      <h1 className="text-2xl font-bold text-amber-900 mb-2">
        Bem-vindo ao PantryPro
      </h1>
      <p className="text-amber-700 mb-8">
        {currentRestaurant
          ? `Gerencie ${currentRestaurant.fantasyName}`
          : "Selecione ou cadastre um restaurante para começar"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/restaurants"
          className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition"
        >
          <h2 className="font-semibold text-amber-900">Restaurantes</h2>
          <p className="text-sm text-amber-600 mt-1">
            Cadastre e gerencie seus estabelecimentos
          </p>
        </Link>
        <Link
          href="/dashboard/stock"
          className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition"
        >
          <h2 className="font-semibold text-amber-900">Estoque</h2>
          <p className="text-sm text-amber-600 mt-1">
            Controle de produtos e movimentações
          </p>
        </Link>
        <Link
          href="/dashboard/purchases"
          className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition"
        >
          <h2 className="font-semibold text-amber-900">Compras</h2>
          <p className="text-sm text-amber-600 mt-1">
            Pedidos e recebimento de mercadorias
          </p>
        </Link>
        <Link
          href="/dashboard/recipes"
          className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition"
        >
          <h2 className="font-semibold text-amber-900">Receitas</h2>
          <p className="text-sm text-amber-600 mt-1">
            Fichas técnicas com custo dinâmico
          </p>
        </Link>
        <Link
          href="/dashboard/cash-flow"
          className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition"
        >
          <h2 className="font-semibold text-amber-900">Fluxo de Caixa</h2>
          <p className="text-sm text-amber-600 mt-1">
            Despesas, entradas e controle financeiro
          </p>
        </Link>
      </div>
    </>
  );
}
