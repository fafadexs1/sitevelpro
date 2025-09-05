
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import {
  LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi,
  LayoutDashboard, FileText, BarChart, Settings, LogOut, ChevronDown, Package, Building, Database, PlusCircle, Trash2, Smile, Check
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
import { setupDatabase } from '@/lib/supabase/actions';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as icons from 'lucide-react';

// ==================================
// Tipagem dos Planos
// ==================================
type FeatureWithIcon = {
  icon: string;
  text: string;
};

type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  price: number;
  features_with_icons: FeatureWithIcon[];
  highlight: boolean;
  has_tv: boolean;
};

// ==================================
// Schemas de Validação
// ==================================
const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
type LoginFormData = z.infer<typeof loginSchema>;

const featureSchema = z.object({
  icon: z.string().min(1, "Ícone é obrigatório"),
  text: z.string().min(3, "Descrição do recurso é obrigatória"),
});

const planSchema = z.object({
  type: z.enum(['residencial', 'empresarial'], { required_error: "Tipo é obrigatório" }),
  speed: z.string().min(3, "Velocidade é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  features_with_icons: z.array(featureSchema).min(1, "Adicione pelo menos um recurso"),
  highlight: z.boolean().default(false),
  has_tv: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;


// ==================================
// Componente de Login
// ==================================
function AdminLogin({ onLogin }: { onLogin: (user: SupabaseUser) => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(data: LoginFormData) {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro de Login", description: error.message });
    } else if (user) {
      toast({ title: "Sucesso!", description: "Login realizado com sucesso." });
      onLogin(user);
    }
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
      <motion.div
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                      <Input placeholder="admin@velpro.com" {...field} className="pl-9" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                      <Input type={show ? "text" : "password"} placeholder="••••••••" {...field} className="pl-9 pr-10" />
                      <button type="button" aria-label="toggle" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit" className="w-full mt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}

// ==================================
// Componente de Adicionar Plano (RECONSTRUÍDO E SIMPLIFICADO)
// ==================================
function AddPlanForm({ onPlanAdded, onOpenChange, iconList }: { onPlanAdded: () => void, onOpenChange: (open: boolean) => void, iconList: string[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            type: "residencial",
            speed: "",
            price: 0,
            features_with_icons: [{ icon: "Wifi", text: "Wi-Fi 6 de alta performance" }],
            highlight: false,
            has_tv: false,
        },
        mode: 'onChange',
    });

    const { control, handleSubmit, formState: { errors } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features_with_icons",
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
            form.reset();
        }
        setIsSubmitting(false);
    };
  
    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Plano</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do novo plano que será exibido no site.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                     <FormField
                        control={control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Plano</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormField 
                        control={control}
                        name="speed" 
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Velocidade</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: 500 Mega" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} 
                    />
                    <FormField 
                        control={control}
                        name="price" 
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço (R$)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Ex: 99.90"
                                        {...field}
                                        value={field.value ?? 0}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} 
                    />
                    
                    <div>
                        <FormLabel>Recursos</FormLabel>
                        <div className="space-y-2 mt-2">
                            {(Array.isArray(fields) ? fields : []).map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2 p-2 rounded-lg border border-white/10">
                                    <FormField
                                        control={control}
                                        name={`features_with_icons.${index}.icon`}
                                        render={({ field }) => (
                                            <FormItem className="w-1/3">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Ícone" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-[260px]">
                                                        {(Array.isArray(iconList) ? iconList : []).map((iconName) => {
                                                            const IconComponent = icons[iconName as keyof typeof icons] as React.ElementType | undefined;
                                                            return (
                                                                <SelectItem key={iconName} value={iconName}>
                                                                    <div className="flex items-center gap-2">
                                                                        {IconComponent ? <IconComponent className="h-4 w-4" /> : <Smile className="h-4 w-4" />}
                                                                        {iconName}
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                        {(!iconList || iconList.length === 0) && (
                                                            <div className="px-3 py-2 text-xs text-white/60">Nenhum ícone disponível</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`features_with_icons.${index}.text`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormControl>
                                                    <Input placeholder="Descrição do recurso" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ icon: "Check", text: "" })}>
                            <PlusCircle className="h-4 w-4 mr-2"/> Adicionar Recurso
                        </Button>
                        <FormMessage>{errors.features_with_icons?.message}</FormMessage>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <FormField control={control} name="highlight" render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Destacar plano?</FormLabel>
                            </FormItem>
                        )} />
                        <FormField control={control} name="has_tv" render={({ field }) => (
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
    );
}

// ==================================
// Componentes do Dashboard
// ==================================

const PlansContent = ({iconList}: {iconList: string[]}) => {
    const [activeTab, setActiveTab] = useState<'residencial' | 'empresarial'>('residencial');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

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
                    <p className="text-white/60">Adicione, edite ou remova os planos exibidos no site.</p>
                </div>
                <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                    <DialogTrigger asChild>
                        <Button>Adicionar Plano</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-[600px]">
                       <AddPlanForm onPlanAdded={getPlans} onOpenChange={setIsAddPlanOpen} iconList={iconList} />
                    </DialogContent>
                </Dialog>
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

const DatabaseContent = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSetupDatabase = async () => {
        setIsLoading(true);
        try {
            await setupDatabase();
            toast({
                title: "Sucesso!",
                description: "O banco de dados foi configurado. A tabela 'plans' está pronta.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao configurar o banco de dados",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Banco de Dados</h1>
                    <p className="text-white/60">Gerencie a estrutura do seu banco de dados.</p>
                </div>
            </header>
            <Card className="border-white/10 bg-neutral-950">
                <CardHeader>
                    <CardTitle>Ações de Schema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-white/70">
                        Esta ação irá criar a tabela `plans` em seu banco de dados Supabase se ela não existir.
                        É seguro executar esta ação múltiplas vezes.
                    </p>
                    <Button onClick={handleSetupDatabase} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                        Configurar/Atualizar Banco de Dados
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};


function AdminDashboard({ user, onLogout, iconList }: { user: SupabaseUser, onLogout: () => void, iconList: string[] }) {
    const [activeView, setActiveView] = useState<'plans' | 'database'>('plans');
    const supabase = createClient();
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
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
                </nav>

                <div className="border-t border-white/10 pt-4">
                    <div className="text-xs text-white/60 mb-2 px-3">
                        <p>Logado como:</p>
                        <p className="font-medium text-white truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5">
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
                        {activeView === 'plans' && <PlansContent iconList={iconList} />}
                        {activeView === 'database' && <DatabaseContent />}
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

    const Icon = ({ name }: { name: string }) => {
        const LucideIcon = icons[name as keyof typeof icons] as React.ElementType;
        if (!LucideIcon) return <Smile className="h-4 w-4 shrink-0 text-primary" />;
        return <LucideIcon className="h-4 w-4 shrink-0 text-primary" />;
    };

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
                        <TableCell className="text-white/80">
                            <ul className="space-y-1">
                            {(plan.features_with_icons || []).map((f, idx) => (
                                <li key={`${plan.id}-feature-${idx}`} className="flex items-center gap-2">
                                    <Icon name={f.icon} />
                                    <span>{f.text}</span>
                                </li>
                            ))}
                            </ul>
                        </TableCell>
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
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    
    // Lista de ícones segura (evita undefined e exports não-ícone)
    const iconList = useMemo(() => {
      const mod = (icons ?? {}) as Record<string, unknown>;
      return Object.keys(mod)
        .filter((k) => /^[A-Z]/.test(k)) // geralmente ícones começam com maiúscula
        .filter((k) => !['createLucideIcon', 'LucideIcon'].includes(k));
    }, []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase.auth]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
  
    if (!user) {
        return <AdminLogin onLogin={(loggedInUser) => setUser(loggedInUser)} />;
    }
  
    return <AdminDashboard user={user} onLogout={() => setUser(null)} iconList={iconList} />;
}

    