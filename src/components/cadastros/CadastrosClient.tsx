"use client";

import { useState, useEffect } from "react";
import {
  unitsApi,
  categoriesApi,
  suppliersApi,
  type Unit,
  type Category,
  type Supplier,
} from "@/lib/api";

const UNIT_CATEGORIES = [
  { value: "WEIGHT", label: "Peso" },
  { value: "VOLUME", label: "Volume" },
  { value: "COUNT", label: "Quantidade" },
  { value: "LENGTH", label: "Comprimento" },
  { value: "TIME", label: "Tempo" },
] as const;

const getCategoryLabel = (value: string) =>
  UNIT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export function CadastrosClient() {
  const [activeTab, setActiveTab] = useState<"units" | "categories" | "suppliers">("units");
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [unitForm, setUnitForm] = useState({
    name: "",
    symbol: "",
    category: "WEIGHT",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    taxId: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [u, c, s] = await Promise.all([
        unitsApi.list(),
        categoriesApi.list(),
        suppliersApi.list(),
      ]);
      setUnits(u);
      setCategories(c);
      setSuppliers(s);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await unitsApi.create(unitForm);
      setUnitForm({ name: "", symbol: "", category: "WEIGHT" });
      setUnits(await unitsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar unidade");
    }
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await categoriesApi.create(categoryForm);
      setCategoryForm({ name: "", description: "" });
      setCategories(await categoriesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar categoria");
    }
  }

  async function handleSupplierSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await suppliersApi.create(supplierForm);
      setSupplierForm({ name: "", taxId: "", email: "", phone: "" });
      setSuppliers(await suppliersApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar fornecedor");
    }
  }

  const tabs = [
    { id: "units" as const, label: "Unidades" },
    { id: "categories" as const, label: "Categorias" },
    { id: "suppliers" as const, label: "Fornecedores" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-8">Cadastros</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === t.id
                ? "bg-amber-600 text-white"
                : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse text-amber-600">Carregando...</div>
      ) : (
        <>
          {activeTab === "units" && (
            <div className="space-y-6">
              <form
                onSubmit={handleUnitSubmit}
                className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
              >
                <h2 className="font-semibold text-amber-900 mb-4">
                  Nova unidade
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={unitForm.name}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                      placeholder="Quilograma"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Símbolo
                    </label>
                    <input
                      type="text"
                      value={unitForm.symbol}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, symbol: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                      placeholder="kg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Categoria
                    </label>
                    <select
                      value={unitForm.category}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, category: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    >
                      {UNIT_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Salvar
                </button>
              </form>
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50/50">
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Símbolo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Categoria
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-amber-50 hover:bg-amber-50/30"
                      >
                        <td className="py-3 px-4 text-amber-900">{u.name}</td>
                        <td className="py-3 px-4 text-amber-700">{u.symbol}</td>
                        <td className="py-3 px-4 text-amber-700">
                          {getCategoryLabel(u.category)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <form
                onSubmit={handleCategorySubmit}
                className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
              >
                <h2 className="font-semibold text-amber-900 mb-4">
                  Nova categoria
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
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
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Salvar
                </button>
              </form>
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50/50">
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-amber-50 hover:bg-amber-50/30"
                      >
                        <td className="py-3 px-4 text-amber-900">{c.name}</td>
                        <td className="py-3 px-4 text-amber-700">
                          {c.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "suppliers" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSupplierSubmit}
                className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm"
              >
                <h2 className="font-semibold text-amber-900 mb-4">
                  Novo fornecedor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={supplierForm.name}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      CNPJ/CPF
                    </label>
                    <input
                      type="text"
                      value={supplierForm.taxId}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          taxId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={supplierForm.phone}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 text-black placeholder:text-gray-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Salvar
                </button>
              </form>
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50/50">
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        CNPJ/CPF
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-amber-900">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-amber-50 hover:bg-amber-50/30"
                      >
                        <td className="py-3 px-4 text-amber-900">{s.name}</td>
                        <td className="py-3 px-4 text-amber-700">{s.taxId}</td>
                        <td className="py-3 px-4 text-amber-700">
                          {s.email || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
