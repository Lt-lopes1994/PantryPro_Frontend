"use client";

import { useState, useEffect } from "react";
import { useRestaurant } from "@/context/restaurant-context";
import {
  purchasesApi,
  stockApi,
  suppliersApi,
  type Purchase,
  type StockItem,
} from "@/lib/api";

export function PurchasesClient() {
  const { currentRestaurant } = useRestaurant();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [receiving, setReceiving] = useState<Purchase | null>(null);
  const [form, setForm] = useState({
    supplierId: 0,
    orderNumber: "",
    invoiceNumber: "",
    notes: "",
    items: [
      { stockItemId: 0, quantityOrdered: 0, unitPrice: 0 },
    ],
  });
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<number, number>
  >({});
  const [error, setError] = useState("");

  const restaurantId = currentRestaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      Promise.all([
        purchasesApi.list(restaurantId),
        stockApi.listItems(restaurantId),
        suppliersApi.list(),
      ])
        .then(([pData, sData, supData]) => {
          setPurchases(pData);
          setStockItems(sData);
          setSuppliers(supData);
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
      const validItems = form.items.filter(
        (i) =>
          i.stockItemId &&
          i.quantityOrdered > 0 &&
          i.unitPrice >= 0
      );
      if (validItems.length === 0) {
        setError("Adicione pelo menos um item à compra");
        setLoading(false);
        return;
      }
      await purchasesApi.create({
        supplierId: form.supplierId,
        restaurantId,
        orderNumber: form.orderNumber || undefined,
        invoiceNumber: form.invoiceNumber || undefined,
        notes: form.notes || undefined,
        items: validItems,
      });
      setForm({
        supplierId: 0,
        orderNumber: "",
        invoiceNumber: "",
        notes: "",
        items: [
          { stockItemId: 0, quantityOrdered: 0, unitPrice: 0 },
        ],
      });
      setShowForm(false);
      const data = await purchasesApi.list(restaurantId);
      setPurchases(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar compra"
      );
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setForm({
      ...form,
      items: [
        ...form.items,
        { stockItemId: 0, quantityOrdered: 0, unitPrice: 0 },
      ],
    });
  }

  function updateItem(index: number, field: string, value: number) {
    const next = [...form.items];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, items: next });
  }

  function removeItem(index: number) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  async function handleReceive() {
    if (!receiving || !restaurantId) return;
    const items = receiving.items
      .map((pi) => ({
        purchaseItemId: pi.id,
        quantityReceived:
          receiveQuantities[pi.id] ?? pi.quantityOrdered,
      }))
      .filter((i) => i.quantityReceived > 0);

    if (items.length === 0) {
      setError("Informe as quantidades recebidas");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await purchasesApi.receive(receiving.id, restaurantId, items);
      setReceiving(null);
      setReceiveQuantities({});
      const data = await purchasesApi.list(restaurantId);
      setPurchases(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao receber compra"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!restaurantId) {
    return (
      <div className="p-8 text-amber-600">
        Selecione ou cadastre um restaurante para gerenciar compras.
      </div>
    );
  }

  if (loading && purchases.length === 0) {
    return <div className="animate-pulse text-amber-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-900">Compras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          {showForm ? "Cancelar" : "Nova compra"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
        >
          <h2 className="font-semibold text-amber-900 mb-4">Nova compra</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Fornecedor
              </label>
              <select
                value={form.supplierId || ""}
                onChange={(e) =>
                  setForm({ ...form, supplierId: +e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200"
                required
              >
                <option value="">Selecione</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Nº Pedido
              </label>
              <input
                type="text"
                value={form.orderNumber}
                onChange={(e) =>
                  setForm({ ...form, orderNumber: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Nº Nota fiscal
              </label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm({ ...form, invoiceNumber: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-amber-200"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Itens
            </label>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select
                  value={item.stockItemId || ""}
                  onChange={(e) =>
                    updateItem(i, "stockItemId", +e.target.value)
                  }
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
                  type="number"
                  step="0.01"
                  placeholder="Qtd"
                  value={item.quantityOrdered || ""}
                  onChange={(e) =>
                    updateItem(i, "quantityOrdered", +e.target.value || 0)
                  }
                  className="w-24 px-4 py-2 rounded-lg border border-amber-200"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={item.unitPrice || ""}
                  onChange={(e) =>
                    updateItem(i, "unitPrice", +e.target.value || 0)
                  }
                  className="w-28 px-4 py-2 rounded-lg border border-amber-200"
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
              + Adicionar item
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Observações
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-amber-200"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Criar compra"}
          </button>
        </form>
      )}

      {receiving && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
          <h2 className="font-semibold text-amber-900 mb-4">
            Receber compra #{receiving.id} - {receiving.supplier.name}
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2 mb-4">
            {receiving.items.map((pi) => (
              <div key={pi.id} className="flex items-center gap-4">
                <span className="w-48">{pi.stockItem.itemName}</span>
                <span className="text-amber-600 text-sm">
                  Ordenado: {pi.quantityOrdered}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Recebido"
                  value={
                    receiveQuantities[pi.id] ?? pi.quantityOrdered ?? ""
                  }
                  onChange={(e) =>
                    setReceiveQuantities({
                      ...receiveQuantities,
                      [pi.id]: +e.target.value || 0,
                    })
                  }
                  className="w-24 px-3 py-1.5 rounded border border-amber-200"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReceive}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? "Recebendo..." : "Confirmar recebimento"}
            </button>
            <button
              onClick={() => {
                setReceiving(null);
                setError("");
              }}
              className="px-6 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/50">
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                #
              </th>
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                Fornecedor
              </th>
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                NF / Pedido
              </th>
              <th className="text-left py-3 px-4 font-medium text-amber-900">
                Status
              </th>
              <th className="text-right py-3 px-4 font-medium text-amber-900">
                Total
              </th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr
                key={p.id}
                className="border-b border-amber-50 hover:bg-amber-50/30"
              >
                <td className="py-3 px-4 font-medium text-amber-900">
                  {p.id}
                </td>
                <td className="py-3 px-4 text-amber-700">
                  {p.supplier.name}
                </td>
                <td className="py-3 px-4 text-amber-700">
                  {p.invoiceNumber || p.orderNumber || "-"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      p.status === "RECEIVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-amber-900">
                  R$ {p.finalValue.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  {p.status !== "RECEIVED" && (
                    <button
                      onClick={() => {
                        setReceiving(p);
                        setReceiveQuantities(
                          Object.fromEntries(
                            p.items.map((i) => [i.id, i.quantityOrdered])
                          )
                        );
                        setError("");
                      }}
                      className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Receber
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && (
          <div className="p-12 text-center text-amber-600">
            Nenhuma compra. Clique em &quot;Nova compra&quot; para começar.
          </div>
        )}
      </div>
    </div>
  );
}
