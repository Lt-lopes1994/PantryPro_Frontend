"use client";

import { useState, useEffect } from "react";
import { useRestaurant } from "@/context/restaurant-context";
import { restaurantsApi } from "@/lib/api";

export function RestaurantsClient() {
  const { restaurants, loadRestaurants } = useRestaurant();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bussinesName: "",
    fantasyName: "",
    address: "",
    phone: "",
    taxId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await restaurantsApi.create(form);
      setForm({
        bussinesName: "",
        fantasyName: "",
        address: "",
        phone: "",
        taxId: "",
      });
      setShowForm(false);
      await loadRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-900">Restaurantes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          {showForm ? "Cancelar" : "Novo restaurante"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
        >
          <h2 className="font-semibold text-amber-900 mb-4">
            Cadastrar restaurante
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Razão social
              </label>
              <input
                type="text"
                value={form.bussinesName}
                onChange={(e) =>
                  setForm({ ...form, bussinesName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Nome fantasia
              </label>
              <input
                type="text"
                value={form.fantasyName}
                onChange={(e) =>
                  setForm({ ...form, fantasyName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                placeholder="00000000000199"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        {restaurants.length === 0 ? (
          <div className="p-12 text-center text-amber-600">
            Nenhum restaurante cadastrado. Clique em &quot;Novo restaurante&quot; para
            começar.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-100 bg-amber-50/50">
                <th className="text-left py-3 px-4 font-medium text-amber-900">
                  Nome
                </th>
                <th className="text-left py-3 px-4 font-medium text-amber-900">
                  CNPJ
                </th>
                <th className="text-left py-3 px-4 font-medium text-amber-900">
                  Endereço
                </th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-amber-50 hover:bg-amber-50/30"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-amber-900">
                      {r.fantasyName}
                    </span>
                    <span className="block text-sm text-amber-600">
                      {r.bussinesName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-amber-700">{r.taxId}</td>
                  <td className="py-3 px-4 text-amber-700">{r.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
