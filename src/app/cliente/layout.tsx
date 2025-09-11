"use client";

import React, { useState, useEffect } from "react";
import { LoginScreen } from "@/components/cliente/LoginScreen";
import { Dashboard } from "@/components/cliente/Dashboard";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { ContractProvider } from "@/components/cliente/ContractProvider";

// Este é o componente principal que age como um "controlador de rota" no lado do cliente.
// Ele decide se mostra a tela de login ou o painel principal (dashboard).
export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  // Um estado simples para simular o login. Em um app real, isso viria
  // do Supabase Auth ou outro provedor de autenticação.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Funções para simular login e logout.
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  useEffect(() => {
    // Simula uma verificação de sessão
    setTimeout(() => {
        setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  // Se o usuário não estiver logado, mostra a tela de login.
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Se o usuário estiver logado, mostra o painel principal.
  return (
    <ContractProvider>
        <Dashboard onLogout={handleLogout}>{children}</Dashboard>
    </ContractProvider>
  );
}
