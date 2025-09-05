
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi,
  LayoutDashboard, FileText, BarChart, Settings, LogOut, ChevronDown, Package, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// ==================================
// Mock Data (temporário)
// ==================================
const plansData = {
  residencial: [
    { id: "R1", speed: "100 Mega", price: 79.9, features: ["Wi‑Fi 6 incluso", "Instalação rápida"], highlight: false },
    { id: "R2", speed: "300 Mega", price: 99.9, features: ["Roteador Wi‑Fi 6", "Streaming 4K"], highlight: true },
    { id: "R3", speed: "500 Mega", price: 129.9, features: ["Latência ultrabaixa", "Jogos online"], highlight: false },
    { id: "R4", speed: "1 Giga", price: 199.9, features: ["Link premium", "Suporte VIP"], highlight: false },
  ],
  empresarial: [
    { id: "E1", speed: "300 Mega", price: 149.9, features: ["SLA comercial", "Ativação express"], highlight: false },
    { id: "E2", speed: "500 Mega", price: 219.9, features: ["IP Fixo opcional", "Wi‑Fi Mesh"], highlight: true },
    { id: "E3", speed: "1 Giga", price: 359.9, features: ["SLA 99,9%", "Suporte dedicado"], highlight: false },
    { id: "E4", speed: "2 Giga", price: 699.9, features: ["Backbone redundante", "Roteamento BGP"], highlight: false },
  ]
};

// ==================================
// Componente de Login
// ==================================
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
       <Link href="/" className="flex items-center gap-3 w-fit mb-8">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-neutral-950 shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Velpro Telecom</p>
            <p className="text-xs text-white/60">Painel Administrativo</p>
          </div>
        </Link>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/20">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Acesso Restrito</h2>
          <p className="text-sm text-white/60">Entre com suas credenciais</p>
        </div>

        <label className="mb-2 block text-sm text-white/70">Usuário</label>
        <div className="relative mb-4">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input required placeholder="admin" className="pl-9" />
        </div>

        <label className="mb-2 block text-sm text-white/70">Senha</label>
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input required type={show ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" />
          <button type="button" aria-label="toggle" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button disabled={loading} type="submit" className="w-full mt-4">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.form>
    </div>
  );
}


// ==================================
// Componentes do Dashboard
// ==================================

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'residencial' | 'empresarial'>('residencial');

  return (
    <div className="flex min-h-screen bg-neutral-900">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-white/10 bg-neutral-950 p-4 hidden md:flex">
        <div className="flex items-center gap-3 w-fit mb-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-neutral-950 shadow-lg shadow-primary/20">
                <Wifi className="h-5 w-5" />
            </div>
            <div>
                <p className="text-lg font-semibold leading-none">Velpro</p>
                <p className="text-xs text-white/60">Admin</p>
            </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
            <Button variant="ghost" className="justify-start gap-2 bg-primary/10 text-primary">
                <LayoutDashboard className="h-4 w-4" /> Painel
            </Button>
            <Button variant="ghost" className="justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5">
                <FileText className="h-4 w-4" /> Páginas
            </Button>
            <Button variant="ghost" className="justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5">
                <BarChart className="h-4 w-4" /> Analytics
            </Button>
             <Button variant="ghost" className="justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5">
                <Settings className="h-4 w-4" /> Configurações
            </Button>
        </nav>
         <div className="border-t border-white/10 pt-4">
             <Button variant="ghost" onClick={onLogout} className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5">
                <LogOut className="h-4 w-4" /> Sair
            </Button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
                <p className="text-white/60">Adicione, edite ou remova os planos exibidos no site.</p>
            </div>
             <Button>Adicionar Plano</Button>
        </header>

        <Card className="border-white/10 bg-neutral-950">
            <CardHeader>
                <div className="flex items-center border-b border-white/10">
                    <button onClick={() => setActiveTab('residencial')} className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'residencial' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}>
                        <Package className="h-4 w-4"/> Planos Residenciais
                    </button>
                    <button onClick={() => setActiveTab('empresarial')} className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'empresarial' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}>
                        <Building className="h-4 w-4"/> Planos Empresariais
                    </button>
                </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PlansTable plans={plansData[activeTab]} />
                  </motion.div>
              </AnimatePresence>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PlansTable({ plans }: { plans: typeof plansData.residencial }) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-[150px]">Velocidade</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Recursos</TableHead>
                    <TableHead className="text-center">Destaque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {plans.map(plan => (
                    <TableRow key={plan.id} className="border-white/10">
                        <TableCell className="font-medium">{plan.speed}</TableCell>
                        <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                        <TableCell className="text-white/80">{plan.features.join(', ')}</TableCell>
                        <TableCell className="text-center">
                            {plan.highlight && <Badge className="bg-primary/20 text-primary border-primary/30">Sim</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm">Editar</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

// ==================================
// Componente principal da página
// ==================================
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}
