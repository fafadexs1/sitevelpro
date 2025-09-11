"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi, Zap,
} from "lucide-react";
import Link from "next/link";

function LightningBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-2xl" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-40 origin-left bg-primary/70"
          initial={{ opacity: 0, rotate: -10, x: -50, y: 40 * i }}
          animate={{ opacity: [0, 1, 0], x: [0, 20, 100] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 + i * 0.2, ease: "easeOut" }}
          style={{ top: `${10 + i * 12}%`, left: `${5 + (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LightningBG />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-foreground shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Velpro Telecom</p>
            <p className="text-xs text-muted-foreground">Área do Cliente</p>
          </div>
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" /> Internet + TV com suporte qualificado
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Bem-vindo à sua <span className="bg-gradient-to-r from-green-300 to-primary bg-clip-text text-transparent">central</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Emita 2ª via, copie PIX, acompanhe faturas e suporte em tempo real. Tudo em um lugar só.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Entrar</h2>
            <p className="text-sm text-muted-foreground">Acesse com seu CPF/CNPJ e senha</p>
          </div>

          <label className="mb-3 block text-sm text-card-foreground">CPF ou CNPJ</label>
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <input required id="login-document" placeholder="000.000.000-00" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>

          <label className="mb-3 mt-4 block text-sm text-card-foreground">Senha</label>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input required id="login-password" type={show ? "text" : "password"} placeholder="••••••••" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
            <button id="login-toggle-password" type="button" aria-label="toggle" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
            <label className="inline-flex items-center gap-2"><input id="login-remember" type="checkbox" className="h-3.5 w-3.5 rounded border-border bg-transparent" /> Lembrar</label>
            <a id="login-forgot-password" className="hover:text-foreground" href="#">Esqueci a senha</a>
          </div>

          <button id="login-submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Acessar minha conta
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">Ao continuar, você concorda com os Termos e a Política de Privacidade.</p>
        </motion.form>
      </div>
    </div>
  );
}
