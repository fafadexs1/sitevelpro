"use client";

import React, { useState } from "react";
import { LoginScreen } from "@/components/cliente/LoginScreen";
import { Dashboard } from "@/components/cliente/Dashboard";

export default function ClientAreaApp() {
  const [logged, setLogged] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {logged ? <Dashboard onLogout={() => setLogged(false)} /> : <LoginScreen onLogin={() => setLogged(true)} />}
    </div>
  );
}
