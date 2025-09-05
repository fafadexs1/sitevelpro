
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi,
  LayoutDashboard, FileText, BarChart, Settings, LogOut, ChevronDown, Package, Building, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ==================================
// Tipagem dos Planos
// ==================================
type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  price: number;
  features: string[];
  highlight: boolean;
  hasTv: boolean;
};

// ==================================
// Schema de Validação
// ==================================
const planSchema = z.object({
  type: z.enum(['residencial', 'empresarial'], { required_error: "Tipo é obrigatório" }),
  speed: z.string().min(3, "Velocidade é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  features: z.string().min(1, "Adicione pelo menos um recurso").transform(val => val.split(',').map(s => s.trim())),
  highlight: z.boolean().default(false),
  hasTv: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;


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
// Componente de Adicionar Plano
// ==================================

function AddPlanForm({ onPlanAdded, onOpenChange }: { onPlanAdded: () => void, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      type: "residencial",
      speed: "",
      price: 0,
      features: [],
      highlight: false,
      hasTv: false,
    }
  });

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('plans').insert([data]);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: `Não foi possível adicionar o plano: ${error.message}` });
    } else {
      toast({ title: "Sucesso!", description: "Plano adicionado com sucesso." });
      onPlanAdded();
      onOpenChange(false);
      methods.reset();
    }
    setIsSubmitting(false);
  };
  
  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Plano</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo plano que será exibido no site.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <FormField
              control={methods.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plano</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="empresarial">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="speed" render={({ field }) => (
              <FormItem><FormLabel>Velocidade</FormLabel><FormControl><Input placeholder="Ex: 500 Mega" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="price" render={({ field }) => (
              <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 99.90" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="features" render={({ field }) => (
              <FormItem>
                <FormLabel>Recursos</FormLabel>
                <FormControl><Textarea placeholder="Separe os recursos por vírgula. Ex: Wi-Fi 6, Suporte 24/7" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex items-center justify-between">
                <FormField control={methods.control} name="highlight" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Destacar plano?</FormLabel>
                  </FormItem>
                )} />
                <FormField control={methods.control} name="hasTv" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Inclui TV?</FormLabel>
                  </FormItem>
                )} />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : "Adicionar Plano"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </FormProvider>
  );
}


// ==================================
// Componentes do Dashboard
// ==================================

const PlansContent = () => {
    const [activeTab, setActiveTab] = useState<'residencial' | 'empresarial'>('residencial');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    async function getPlans() {
        const supabase = createClient();
        setLoading(true);
        const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
        if (error) {
            console.error("Erro ao buscar planos:", error);
        } else {
            setPlans(data as Plan[]);
        }
        setLoading(false);
    }

    useEffect(() => {
        getPlans();
    }, []);

    const filteredPlans = plans.filter(p => p.type === activeTab);

    return (
        <>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
                    <p className="text-white/60">Visualize os planos existentes no site.</p>
                </div>
            </header>
            <Card className="border-white/10 bg-neutral-950">
                <CardHeader>
                    <div className="flex items-center border-b border-white/10">
                        <button onClick={() => setActiveTab('residencial')} className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'residencial' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}>
                            <Package className="h-4 w-4" /> Planos Residenciais
                        </button>
                        <button onClick={() => setActiveTab('empresarial')} className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'empresarial' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}>
                            <Building className="h-4 w-4" /> Planos Empresariais
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
                            {loading ? (
                                <div className="flex justify-center items-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                <PlansTable plans={filteredPlans} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </>
    );
};

const DatabaseContent = ({ onPlanAdded }: { onPlanAdded: () => void }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Banco de Dados</h1>
                    <p className="text-white/60">Gerencie os dados da sua aplicação.</p>
                </div>
            </header>
            <Card className="border-white/10 bg-neutral-950">
                <CardHeader>
                    <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button>Adicionar Novo Plano</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-md">
                            <AddPlanForm onPlanAdded={onPlanAdded} onOpenChange={setIsAddModalOpen} />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </>
    );
};


function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [activeView, setActiveView] = useState<'plans' | 'database'>('plans');

    const refreshPlans = () => {
        // This is a dummy function to be passed down, 
        // as the PlansContent component fetches its own data on mount.
        // A more robust solution might involve a shared state management (like Context or Zustand).
        console.log("Plan added, view might need refresh");
    };

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
                    <Button variant="ghost" onClick={() => setActiveView('plans')} className={`justify-start gap-2 ${activeView === 'plans' ? 'bg-primary/10 text-primary' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                        <LayoutDashboard className="h-4 w-4" /> Planos
                    </Button>
                     <Button variant="ghost" onClick={() => setActiveView('database')} className={`justify-start gap-2 ${activeView === 'database' ? 'bg-primary/10 text-primary' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                        <Database className="h-4 w-4" /> Banco de Dados
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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeView === 'plans' && <PlansContent />}
                        {activeView === 'database' && <DatabaseContent onPlanAdded={refreshPlans} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function PlansTable({ plans }: { plans: Plan[] }) {
    if (plans.length === 0) {
        return <div className="text-center text-white/60 p-8">Nenhum plano deste tipo encontrado.</div>
    }

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

  // In a real app, you'd use a more robust auth check, maybe with useEffect and a token.
  // For this demo, we use a simple state.

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}
