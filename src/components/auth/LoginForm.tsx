"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100"
    >
      <h2 className="text-xl font-semibold text-amber-900 mb-6">Entrar</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60 transition"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="mt-4 text-center text-sm text-amber-700">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-amber-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
