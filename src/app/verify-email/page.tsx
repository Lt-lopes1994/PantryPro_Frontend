"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verificado com sucesso! Agora você pode fazer login.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Falha ao verificar email.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100 max-w-md w-full text-center">
        {status === "loading" && (
          <p className="text-amber-800">Verificando seu email...</p>
        )}
        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-green-700 mb-4">
              Conta ativada!
            </h1>
            <p className="text-amber-800 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
            >
              Ir para login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-red-700 mb-4">
              Erro na verificação
            </h1>
            <p className="text-amber-800 mb-6">{message}</p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="flex-1 py-3 rounded-lg border border-amber-300 text-amber-800 font-medium hover:bg-amber-50 transition"
              >
                Cadastrar novamente
              </Link>
              <Link
                href="/login"
                className="flex-1 py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
              >
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-amber-50">
          <p className="text-amber-800">Carregando...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
