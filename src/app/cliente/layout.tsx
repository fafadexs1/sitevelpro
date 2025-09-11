"use client";

import React, { useState, useEffect } from "react";
import { LoginScreen } from "@/components/cliente/LoginScreen";
import { Dashboard } from "@/components/cliente/Dashboard";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { ContractProvider } from "@/components/cliente/ContractProvider";
import { Button } from "@/components/ui/button";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLoginSuccess = () => {
    // Apenas atualiza o estado de loading, o onAuthStateChange vai cuidar de setar o usuário.
    setLoading(true);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ContractProvider user={user}>
      <Dashboard>{children}</Dashboard>
    </ContractProvider>
  );
}
