"use client";

import { useState, useEffect } from "react";
import { useRestaurant } from "@/context/restaurant-context";
import {
  stockApi,
  unitsApi,
  suppliersApi,
  type StockItem,
} from "@/lib/api";

export function StockClient() {
  const { currentRestaurant } = useRestaurant();
  const [items, setItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<{ id: number; name: string; symbol: string }[]>(
    []
  );
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMovement, setShowMovement] = useState<StockItem | null>(null);
  const [form, setForm] = useState({
    itemName: "",
    quantity: 0,
    unitPrice: 0,
    unitId: 0,
    supplierId: 0,
  });
  const [movementForm, setMovementForm] = useState({
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT",
    quantity: 0,
    reason: "",
  });
  const [error, setError] = useState("");

  const restaurantId = currentRestaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      Promise.all([
        stockApi.listItems(restaurantId),
        unitsApi.list(),
        suppliersApi.list(),
      ])
        .then(([itemsData, unitsData, suppliersData]) => {
          setItems(itemsData);
          setUnits(unitsData);
          setSuppliers(suppliersData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [restaurantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setError("");
    setLoading(true);
    try {
      await stockApi.createItem({
        restaurantId,
        itemName: form.itemName,
        quantity: form.quantity,
        unitPrice: form.unitPrice,
        unitId: form.unitId || undefined,
        supplierId: form.supplierId || undefined,
      });
      setForm({
        itemName: "",
        quantity: 0,
        unitPrice: 0,
        unitId: 0,
        supplierId: 0,
      });
      setShowForm(false);
      const data = await stockApi.listItems(restaurantId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!showMovement) return;
    setError("");
    setLoading(true);
    try {
      await stockApi.createMovement({
        stockItemId: showMovement.id,
        type: movementForm.type,
        quantity: movementForm.quantity,
        reason: movementForm.reason || undefined,
      });
      setShowMovement(null);
      setMovementForm({ type: "IN", quantity: 0, reason: "" });
      if (restaurantId) {
        const data = await stockApi.listItems(restaurantId);
        setItems(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na movimentação");
    } finally {
      setLoading(false);
    }
  }

  if (!restaurantId) {
    return (
      <div className="p-8 text-amber-600">
        Selecione ou cadastre um restaurante para gerenciar o estoque.
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <div className="animate-pulse text-amber-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-900">Estoque</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          {showForm ? "Cancelar" : "Novo item"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
        >
          <h2 className="font-semibold text-amber-900 mb-4">
            Cadastrar produto
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) =>
                  setForm({ ...form, itemName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                step="0.01"
                value={form.quantity || ""}
                onChange={(e) =>
                  setForm({ ...form, quantity: +e.target.value || 0 })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Preço unitário
              </label>
              <input
                type="number"
                step="0.01"
                value={form.unitPrice || ""}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: +e.target.value || 0 })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Unidade
              </label>
              <select
                value={form.unitId || ""}
                onChange={(e) =>
                  setForm({ ...form, unitId: +e.target.value || 0 })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
              >
                <option value="">Selecione</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.symbol} - {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Fornecedor
              </label>
              <select
                value={form.supplierId || ""}
                onChange={(e) =>
                  setForm({ ...form, supplierId: +e.target.value || 0 })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
              >
                <option value="">Selecione</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
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

      {showMovement && (
        <form
          onSubmit={handleMovement}
          className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
        >
          <h2 className="font-semibold text-amber-900 mb-4">
            Movimentação: {showMovement.itemName}
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Tipo
              </label>
              <select
                value={movementForm.type}
                onChange={(e) =>
                  setMovementForm({
                    ...movementForm,
                    type: e.target.value as "IN" | "OUT" | "ADJUSTMENT",
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
              >
                <option value="IN">Entrada</option>
                <option value="OUT">Saída</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                step="0.01"
                value={movementForm.quantity || ""}
                onChange={(e) =>
                  setMovementForm({
                    ...movementForm,
                    quantity: +e.target.value || 0,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={movementForm.reason}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, reason: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Registrar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMovement(null);
                setError("");
              }}
              className="px-6 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/50">
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                Produto
              </th>
              <th className="text-right py-3 px-4 font-medium text-amber-900">
                Qtd
              </th>
              <th className="text-right py-3 px-4 font-medium text-amber-900">
                Preço un.
              </th>
              <th className="text-right py-3 px-4 font-medium text-amber-900">
                Total
              </th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-amber-50 hover:bg-amber-50/30"
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-amber-900">
                    {item.itemName}
                  </span>
                  {item.unit && (
                    <span className="ml-2 text-sm text-amber-600">
                      ({item.unit.symbol})
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-amber-700">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 text-right text-amber-700">
                  R$ {item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-amber-900">
                  R$ {item.totalValue.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => {
                      setShowMovement(item);
                      setError("");
                    }}
                    className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                  >
                    Movimentar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-12 text-center text-amber-600">
            Nenhum item no estoque. Cadastre produtos ou receba uma compra.
          </div>
        )}
      </div>
    </div>
  );
}
