
"use client";

import React, { useState } from "react";
import { LoginScreen } from "@/components/cliente/LoginScreen";
import { Dashboard } from "@/components/cliente/Dashboard";

// Este é o componente principal que age como um "controlador de rota" no lado do cliente.
// Ele decide se mostra a tela de login ou o painel principal (dashboard).
export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  // Um estado simples para simular o login. Em um app real, isso viria
  // do Supabase Auth ou outro provedor de autenticação.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Funções para simular login e logout.
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  // Se o usuário não estiver logado, mostra a tela de login.
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Se o usuário estiver logado, mostra o painel principal.
  return <Dashboard onLogout={handleLogout}>{children}</Dashboard>;
}
