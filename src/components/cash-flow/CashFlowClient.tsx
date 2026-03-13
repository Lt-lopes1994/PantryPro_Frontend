"use client";

import { useState, useEffect, useCallback } from "react";
import { useRestaurant } from "@/context/restaurant-context";
import { cashFlowApi, type CashPeriod } from "@/lib/api";

const COMMON_CATEGORIES = {
  INCOME: ["Vendas", "Delivery", "Outros"],
  EXPENSE: ["Folha", "Fornecedores", "Aluguel", "Contas", "Outros"],
};

export function CashFlowClient() {
  const { currentRestaurant } = useRestaurant();
  const [currentPeriod, setCurrentPeriod] = useState<CashPeriod | null>(null);
  const [periods, setPeriods] = useState<CashPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [txForm, setTxForm] = useState({
    type: "INCOME" as "INCOME" | "EXPENSE",
    category: "",
    value: 0,
    description: "",
  });

  const restaurantId = currentRestaurant?.id;

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const [current, list] = await Promise.all([
        cashFlowApi.getCurrentPeriod(restaurantId),
        cashFlowApi.listPeriods(restaurantId),
      ]);
      setCurrentPeriod(current);
      setPeriods(list);
    } catch {
      setCurrentPeriod(null);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleOpenPeriod(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setError("");
    try {
      await cashFlowApi.openPeriod(restaurantId, openingBalance);
      setShowOpenForm(false);
      setOpeningBalance(0);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir caixa");
    }
  }

  async function handleClosePeriod() {
    if (!currentPeriod || !restaurantId) return;
    setError("");
    try {
      await cashFlowApi.closePeriod(currentPeriod.id, restaurantId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fechar caixa");
    }
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPeriod || !restaurantId) return;
    setError("");
    try {
      await cashFlowApi.addTransaction(
        currentPeriod.id,
        restaurantId,
        txForm
      );
      setShowTransactionForm(false);
      setTxForm({ type: "INCOME", category: "", value: 0, description: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar");
    }
  }

  function getBalance(period: CashPeriod) {
    let balance = period.openingBalance;
    for (const t of period.transactions || []) {
      balance += t.type === "INCOME" ? t.value : -t.value;
    }
    return balance;
  }

  if (!restaurantId) {
    return (
      <div className="p-8 text-amber-600">
        Selecione ou cadastre um restaurante para o fluxo de caixa.
      </div>
    );
  }

  if (loading) {
    return <div className="animate-pulse text-amber-600">Carregando...</div>;
  }

  const balance = currentPeriod ? getBalance(currentPeriod) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-8">
        Fluxo de Caixa
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!currentPeriod ? (
        <div className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
          <h2 className="font-semibold text-amber-900 mb-4">
            Nenhum caixa aberto
          </h2>
          {!showOpenForm ? (
            <button
              onClick={() => {
                const closed = periods
                  .filter((p) => p.status === "CLOSED")
                  .sort(
                    (a, b) =>
                      new Date(b.closedAt || 0).getTime() -
                      new Date(a.closedAt || 0).getTime()
                  );
                if (closed[0]?.closingBalance != null) {
                  setOpeningBalance(closed[0].closingBalance);
                }
                setShowOpenForm(true);
              }}
              className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              Abrir caixa
            </button>
          ) : (
            <form onSubmit={handleOpenPeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Saldo inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalance || ""}
                  onChange={(e) => setOpeningBalance(+e.target.value || 0)}
                  className="w-40 px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpenForm(false)}
                  className="px-6 py-2 rounded-lg border border-amber-200 text-amber-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
              <p className="text-sm text-amber-600">Saldo atual</p>
              <p className="text-2xl font-bold text-amber-900">
                R$ {balance.toFixed(2)}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
              <p className="text-sm text-amber-600">Aberto em</p>
              <p className="text-amber-900">
                {new Date(currentPeriod.openedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
              <button
                onClick={() => {
                  setShowTransactionForm(true);
                  setTxForm({ type: "INCOME", category: "", value: 0, description: "" });
                }}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
              >
                + Entrada
              </button>
              <button
                onClick={() => {
                  setShowTransactionForm(true);
                  setTxForm({ type: "EXPENSE", category: "", value: 0, description: "" });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                - Saída
              </button>
              <button
                onClick={handleClosePeriod}
                className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                Fechar caixa
              </button>
            </div>
          </div>

          {showTransactionForm && (
            <form
              onSubmit={handleAddTransaction}
              className="mb-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
            >
              <h3 className="font-semibold text-amber-900 mb-4">
                {txForm.type === "INCOME" ? "Nova entrada" : "Nova despesa"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    Categoria
                  </label>
                  <select
                    value={txForm.category}
                    onChange={(e) =>
                      setTxForm({ ...txForm, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    required
                  >
                    <option value="">Selecione</option>
                    {(
                      txForm.type === "INCOME"
                        ? COMMON_CATEGORIES.INCOME
                        : COMMON_CATEGORIES.EXPENSE
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={txForm.value || ""}
                    onChange={(e) =>
                      setTxForm({ ...txForm, value: +e.target.value || 0 })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={txForm.description}
                    onChange={(e) =>
                      setTxForm({ ...txForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-6 py-2 rounded-lg border border-amber-200 text-amber-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="mb-8">
            <h3 className="font-semibold text-amber-900 mb-4">
              Movimentações do período
            </h3>
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-100 bg-amber-50/50">
                    <th className="text-left py-3 px-4 font-medium text-amber-900">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-amber-900">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-amber-900">
                      Categoria
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-amber-900">
                      Descrição
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-amber-900">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(currentPeriod.transactions || []).map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-amber-50 hover:bg-amber-50/30"
                    >
                      <td className="py-3 px-4 text-amber-700">
                        {new Date(t.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.type === "INCOME"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.type === "INCOME" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-700">{t.category}</td>
                      <td className="py-3 px-4 text-amber-700">
                        {t.description || "-"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          t.type === "INCOME"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"} R${" "}
                        {t.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(currentPeriod.transactions?.length ?? 0) === 0 && (
                <div className="p-8 text-center text-amber-600">
                  Nenhuma movimentação ainda
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div>
        <h3 className="font-semibold text-amber-900 mb-4">Períodos anteriores</h3>
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-100 bg-amber-50/50">
                <th className="text-left py-3 px-4 font-medium text-amber-900">
                  Abertura
                </th>
                <th className="text-left py-3 px-4 font-medium text-amber-900">
                  Fechamento
                </th>
                <th className="text-right py-3 px-4 font-medium text-amber-900">
                  Saldo final
                </th>
              </tr>
            </thead>
            <tbody>
              {periods
                .filter((p) => p.status === "CLOSED")
                .map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-amber-50 hover:bg-amber-50/30"
                  >
                    <td className="py-3 px-4 text-amber-700">
                      {new Date(p.openedAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-amber-700">
                      {p.closedAt
                        ? new Date(p.closedAt).toLocaleString("pt-BR")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-900">
                      R$ {(p.closingBalance ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {periods.filter((p) => p.status === "CLOSED").length === 0 && (
            <div className="p-8 text-center text-amber-600">
              Nenhum período fechado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
