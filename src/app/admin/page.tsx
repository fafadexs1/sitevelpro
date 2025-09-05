
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Wifi,
  LayoutDashboard,
  Database,
  PlusCircle,
  Trash2,
  Smile,
  LogOut,
  Package,
  Building,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setupDatabase } from "@/lib/supabase/actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import * as icons from "lucide-react";
import Image from "next/image";

// ==================================
// Tipagem
// ==================================
type Plan = {
  id: string;
  type: "residencial" | "empresarial";
  speed: string;
  price: number;
  highlight: boolean;
  has_tv: boolean;
};

type TvPackage = {
    id: string;
    name: string;
    // channels will be added later
    created_at: string;
};


// ==================================
// Schemas de Validação
// ==================================
const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
type LoginFormData = z.infer<typeof loginSchema>;

const planSchema = z.object({
  type: z.enum(["residencial", "empresarial"], {
    required_error: "Tipo é obrigatório",
  }),
  speed: z.string().min(3, "Velocidade é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  highlight: z.boolean().default(false),
  has_tv: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

const defaultPlanValues: PlanFormData = {
  type: "residencial",
  speed: "",
  price: 0,
  highlight: false,
  has_tv: false,
};


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
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: error.message,
      });
    } else if (user) {
      toast({ title: "Sucesso!", description: "Login realizado com sucesso." });
      onLogin(user);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
      <Link href="/" className="mb-8 flex w-fit items-center gap-3">
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
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                      <Input
                        placeholder="admin@velpro.com"
                        {...field}
                        className="pl-9"
                      />
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
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                      <Input
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pl-9 pr-10"
                      />
                      <button
                        type="button"
                        aria-label="toggle"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={loading} type="submit" className="mt-4 w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}

// ==================================
// Componente de Adicionar Plano
// ==================================
function AddPlanForm({
  onPlanAdded,
  onOpenChange,
}: {
  onPlanAdded: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: defaultPlanValues,
    mode: "onChange",
  });

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("plans").insert([data]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível adicionar o plano: ${error.message}`,
      });
    } else {
      toast({ title: "Sucesso!", description: "Plano adicionado com sucesso." });
      onPlanAdded();
      onOpenChange(false);
      form.reset(defaultPlanValues);
    }
    setIsSubmitting(false);
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Plano</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo plano que será exibido no site.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plano</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
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
              control={form.control}
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
              control={form.control}
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
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="!mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <FormField
                control={form.control}
                name="highlight"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Destacar plano?
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_tv"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Inclui TV?
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Plano
            </Button>
          </DialogFooter>
        </form>
      </Form>
  );
}


// ==================================
// Componentes do Dashboard
// ==================================
const PlansContent = () => {
  const [activeTab, setActiveTab] = useState<"residencial" | "empresarial">("residencial");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function getPlans() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Erro ao buscar planos:", error);
    } else {
      setPlans((data as Plan[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getPlans();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPlans = useMemo(
    () => plans.filter((p) => p.type === activeTab),
    [plans, activeTab]
  );

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
          <p className="text-white/60">Adicione, edite ou remova os planos exibidos no site.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-xl">
            <AddPlanForm
              onPlanAdded={getPlans}
              onOpenChange={setIsModalOpen}
            />
          </DialogContent>
        </Dialog>
      </header>

      <Card className="border-white/10 bg-neutral-950">
        <CardHeader>
          <div className="flex items-center border-b border-white/10">
            <button
              onClick={() => setActiveTab("residencial")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                activeTab === "residencial"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> Planos Residenciais
            </button>
            <button
              onClick={() => setActiveTab("empresarial")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                activeTab === "empresarial"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/60 hover:text-white"
              }`}
            >
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
                <div className="flex items-center justify-center p-8">
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

const TvPackagesContent = () => {
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
  
    const getPackages = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('tv_packages').select('*');
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar pacotes', description: error.message });
        } else {
            setPackages(data as TvPackage[] ?? []);
        }
        setLoading(false);
    };

    useEffect(() => {
        getPackages();
    }, []);
  
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
  
    return (
      <>
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pacotes de TV</h1>
            <p className="text-white/60">Crie e gerencie os pacotes de canais.</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Pacote
          </Button>
        </header>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="border-white/10 bg-neutral-900/60">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pkg.name}
                  <Button variant="ghost" size="sm">Editar</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-white/70">X canais</p>
                {/* Channel logos will be added later */}
              </CardContent>
            </Card>
          ))}
           {packages.length === 0 && <p className="text-white/60 col-span-full">Nenhum pacote de TV encontrado.</p>}
        </div>
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
        description: "O banco de dados foi configurado com as tabelas necessárias.",
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
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banco de Dados</h1>
          <p className="text-white/60">Gerencie a estrutura do seu banco de dados.</p>
        </div>
      </header>

      <Card className="bg-neutral-950 border-white/10">
        <CardHeader>
          <CardTitle>Ações de Schema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            Esta ação irá criar as tabelas <code>plans</code>, <code>tv_packages</code> e <code>tv_channels</code> em seu banco de dados Supabase se elas
            não existirem. É seguro executar esta ação múltiplas vezes.
          </p>
          <Button onClick={handleSetupDatabase} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Configurar/Atualizar Banco de Dados
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

function AdminDashboard({
  user,
  onLogout,
}: {
  user: SupabaseUser;
  onLogout: () => void;
}) {
  const [activeView, setActiveView] = useState<"plans" | "tv_packages" | "database">("plans");
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const navItems = [
    { key: "plans", label: "Planos", icon: LayoutDashboard },
    { key: "tv_packages", label: "Pacotes de TV", icon: Tv },
    { key: "database", label: "Banco de Dados", icon: Database },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-900">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-neutral-950 p-4 md:flex">
        <div className="mb-8 flex w-fit items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-neutral-950 shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Velpro</p>
            <p className="text-xs text-white/60">Admin</p>
          </div>
        </div>

        <nav className="flex flex-grow flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => setActiveView(item.key as any)}
              className={`justify-start gap-2 ${
                activeView === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Button>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-2 px-3 text-xs text-white/60">
            <p>Logado como:</p>
            <p className="truncate font-medium text-white">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-white/70 hover:bg-white/5 hover:text-white"
          >
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
            {activeView === "plans" && <PlansContent />}
            {activeView === "tv_packages" && <TvPackagesContent />}
            {activeView === "database" && <DatabaseContent />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PlansTable({ plans }: { plans: Plan[] }) {
  if (!plans || plans.length === 0) {
    return <div className="p-8 text-center text-white/60">Nenhum plano deste tipo encontrado.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="w-[150px]">Velocidade</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead className="text-center">Destaque</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id} className="border-white/10">
            <TableCell className="font-medium">{plan.speed}</TableCell>
            <TableCell>R$ {Number(plan.price || 0).toFixed(2)}</TableCell>
            <TableCell className="text-center">
              {plan.highlight && (
                <Badge className="border-primary/30 bg-primary/20 text-primary">Sim</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ==================================
// Componente principal da página
// ==================================
export default function AdminPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
}
