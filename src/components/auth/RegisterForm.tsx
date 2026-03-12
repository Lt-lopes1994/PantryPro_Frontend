"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    personalId: "",
    docType: "CPF",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(form);
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100"
    >
      <h2 className="text-xl font-semibold text-amber-900 mb-6">Crie sua conta</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            CPF
          </label>
          <input
            type="text"
            value={form.personalId}
            onChange={(e) => setForm({ ...form, personalId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder="00000000000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            minLength={6}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60 transition"
      >
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>

      <p className="mt-4 text-center text-sm text-amber-700">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-amber-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
