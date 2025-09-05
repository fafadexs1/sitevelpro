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

// ==================================
// Tipagem dos Planos
// ==================================
type FeatureWithIcon = {
  icon: string;
  text: string;
};

type Plan = {
  id: string;
  type: "residencial" | "empresarial";
  speed: string;
  price: number;
  features_with_icons: FeatureWithIcon[];
  highlight: boolean;
  has_tv: boolean;
};

// ==================================
// Schemas de Validação e Valores Padrão
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
  type: z.enum(["residencial", "empresarial"], {
    required_error: "Tipo é obrigatório",
  }),
  speed: z.string().min(3, "Velocidade é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  features_with_icons: z.array(featureSchema).min(1, "Adicione pelo menos um recurso."),
  highlight: z.boolean().default(false),
  has_tv: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

const defaultPlanValues: PlanFormData = {
  type: "residencial",
  speed: "",
  price: 0,
  features_with_icons: [{ icon: "Wifi", text: "Wi-Fi 6 de alta performance" }],
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
// Componente de Adicionar/Editar Plano (Nova Lógica)
// ==================================
function AddPlanForm({
  onPlanAdded,
  onOpenChange,
  iconList,
}: {
  onPlanAdded: () => void;
  onOpenChange: (open: boolean) => void;
  iconList: string[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: defaultPlanValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features_with_icons",
  });
  
  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("plans").insert([data]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar plano",
        description: error.message,
      });
    } else {
      toast({ title: "Sucesso!", description: "Plano salvo com sucesso." });
      onPlanAdded(); // Atualiza a lista de planos
      onOpenChange(false); // Fecha o modal
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Plano</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do novo plano que será exibido no site.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-1">
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

          <div>
            <FormLabel>Recursos</FormLabel>
            <div className="mt-2 space-y-3">
              {(Array.isArray(fields) ? fields : []).map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`features_with_icons.${index}.icon`}
                    render={({ field }) => (
                      <FormItem className="w-1/3">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ícone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[250px]">
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features_with_icons.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="Descrição do recurso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-400 hover:bg-red-400/10 hover:text-red-400"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => append({ icon: "Check", text: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Recurso
            </Button>
             {form.formState.errors.features_with_icons && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.features_with_icons.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between !mt-6 border-t border-white/10 pt-4">
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
const PlansContent = ({ iconList }: { iconList: string[] }) => {
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
    getPlans();
  }, []);

  const filteredPlans = plans.filter((p) => p.type === activeTab);

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
          <p className="text-white/60">Adicione, edite ou remova os planos exibidos no site.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-xl">
            <AddPlanForm
              onPlanAdded={getPlans}
              onOpenChange={setIsModalOpen}
              iconList={iconList}
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
            Esta ação irá criar a tabela <code>plans</code> em seu banco de dados Supabase se ela
            não existir. É seguro executar esta ação múltiplas vezes.
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
  iconList,
}: {
  user: SupabaseUser;
  onLogout: () => void;
  iconList: string[];
}) {
  const [activeView, setActiveView] = useState<"plans" | "database">("plans");
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

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
          <Button
            variant="ghost"
            onClick={() => setActiveView("plans")}
            className={`justify-start gap-2 ${
              activeView === "plans"
                ? "bg-primary/10 text-primary"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Planos
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveView("database")}
            className={`justify-start gap-2 ${
              activeView === "database"
                ? "bg-primary/10 text-primary"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Database className="h-4 w-4" /> Banco de Dados
          </Button>
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
            {activeView === "plans" && <PlansContent iconList={iconList} />}
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

  const Icon = ({ name }: { name: string }) => {
    const LucideIcon = icons[name as keyof typeof icons] as React.ElementType | undefined;
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
        {plans.map((plan) => (
          <TableRow key={plan.id} className="border-white/10">
            <TableCell className="font-medium">{plan.speed}</TableCell>
            <TableCell>R$ {Number(plan.price || 0).toFixed(2)}</TableCell>
            <TableCell className="text-white/80">
              <ul className="space-y-1">
                {(plan.features_with_icons ?? []).map((f, idx) => (
                  <li key={`${plan.id}-feature-${idx}`} className="flex items-center gap-2">
                    <Icon name={f.icon} />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </TableCell>
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

  // Lista de ícones segura
  const iconList = useMemo(() => {
    const mod = (icons ?? {}) as Record<string, unknown>;
    return Object.keys(mod)
      .filter((k) => /^[A-Z]/.test(k)) // ícones começam com maiúscula
      .filter((k) => !["createLucideIcon", "LucideIcon"].includes(k));
  }, []);

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

  return <AdminDashboard user={user} onLogout={() => setUser(null)} iconList={iconList} />;
}
