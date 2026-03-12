"use client";

import { useState, useEffect } from "react";
import { useRestaurant } from "@/context/restaurant-context";
import {
  recipesApi,
  stockApi,
  type Recipe,
  type StockItem,
} from "@/lib/api";

export function RecipesClient() {
  const { currentRestaurant } = useRestaurant();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [costData, setCostData] = useState<Record<number, { totalCost: number }>>({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    items: [{ stockItemId: 0, itemName: "", quantity: 0 }],
  });
  const [error, setError] = useState("");

  const restaurantId = currentRestaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      Promise.all([
        recipesApi.list(restaurantId),
        stockApi.listItems(restaurantId),
      ])
        .then(([rData, sData]) => {
          setRecipes(rData);
          setStockItems(sData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && recipes.length > 0) {
      Promise.all(
        recipes.map((r) =>
          recipesApi.getCost(r.id, restaurantId).then((c) => ({ id: r.id, cost: c }))
        )
      ).then((costs) => {
        const map: Record<number, { totalCost: number }> = {};
        costs.forEach((c) => {
          map[c.id] = { totalCost: c.cost.totalCost };
        });
        setCostData(map);
      });
    }
  }, [restaurantId, recipes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setError("");
    setLoading(true);
    try {
      const validItems = form.items.filter(
        (i) => i.stockItemId && i.itemName && i.quantity > 0
      );
      if (validItems.length === 0) {
        setError("Adicione pelo menos um ingrediente");
        setLoading(false);
        return;
      }
      await recipesApi.create({
        name: form.name,
        description: form.description || undefined,
        restaurantId,
        items: validItems,
      });
      setForm({ name: "", description: "", items: [{ stockItemId: 0, itemName: "", quantity: 0 }] });
      setShowForm(false);
      const data = await recipesApi.list(restaurantId);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar receita");
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setForm({
      ...form,
      items: [...form.items, { stockItemId: 0, itemName: "", quantity: 0 }],
    });
  }

  function updateItem(index: number, field: string, value: string | number) {
    const next = [...form.items];
    next[index] = { ...next[index], [field]: value };
    if (field === "stockItemId") {
      const item = stockItems.find((s) => s.id === +value);
      if (item) next[index].itemName = item.itemName;
    }
    setForm({ ...form, items: next });
  }

  function removeItem(index: number) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  if (!restaurantId) {
    return (
      <div className="p-8 text-amber-600">
        Selecione ou cadastre um restaurante para gerenciar receitas.
      </div>
    );
  }

  if (loading && recipes.length === 0) {
    return <div className="animate-pulse text-amber-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-900">Receitas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          {showForm ? "Cancelar" : "Nova receita"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
        >
          <h2 className="font-semibold text-amber-900 mb-4">Nova receita</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-amber-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-amber-200"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Ingredientes
            </label>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select
                  value={item.stockItemId || ""}
                  onChange={(e) => updateItem(i, "stockItemId", +e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-amber-200"
                >
                  <option value="">Produto</option>
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.itemName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nome"
                  value={item.itemName}
                  onChange={(e) => updateItem(i, "itemName", e.target.value)}
                  className="w-40 px-4 py-2 rounded-lg border border-amber-200"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Qtd"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(i, "quantity", +e.target.value || 0)}
                  className="w-24 px-4 py-2 rounded-lg border border-amber-200"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              + Adicionar ingrediente
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/50">
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                Receita
              </th>
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                Ingredientes
              </th>
              <th className="text-right py-3 px-4 font-medium text-amber-900">
                Custo estimado
              </th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr
                key={r.id}
                className="border-b border-amber-50 hover:bg-amber-50/30"
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-amber-900">{r.name}</span>
                  {r.description && (
                    <span className="block text-sm text-amber-600">
                      {r.description}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-amber-700">
                  {r.RecipeItem?.length || 0} itens
                </td>
                <td className="py-3 px-4 text-right font-medium text-amber-900">
                  R$ {(costData[r.id]?.totalCost ?? 0).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() =>
                      setSelectedRecipe(selectedRecipe?.id === r.id ? null : r)
                    }
                    className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {selectedRecipe?.id === r.id ? "Ocultar" : "Detalhes"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recipes.length === 0 && (
          <div className="p-12 text-center text-amber-600">
            Nenhuma receita. Clique em &quot;Nova receita&quot; para começar.
          </div>
        )}
      </div>

      {selectedRecipe && (
        <div className="mt-6 p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
          <h3 className="font-semibold text-amber-900 mb-4">
            {selectedRecipe.name} — Ingredientes
          </h3>
          <ul className="space-y-2">
            {selectedRecipe.RecipeItem?.map((i) => (
              <li key={i.id} className="flex justify-between text-amber-700">
                <span>
                  {i.itemName} — {i.quantity}{" "}
                  {i.unit?.symbol || ""}
                </span>
                <span>
                  R${" "}
                  {(
                    i.quantity *
                    (i.stockItem?.unitPrice ?? i.unitPrice ?? 0)
                  ).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-medium text-amber-900">
            Custo total: R${" "}
            {(costData[selectedRecipe.id]?.totalCost ?? 0).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
