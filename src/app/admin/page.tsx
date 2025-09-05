
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
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
  LogOut,
  Package,
  Building,
  Tv,
  UserPlus,
  Clapperboard,
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
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";
import { ChannelPackageForm } from "@/components/admin/ChannelPackageForm";

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

type TvChannel = {
  id: string;
  name: string;
  logo_url: string;
  created_at: string;
}

type TvPackage = {
    id: string;
    name: string;
    created_at: string;
};


// ==================================
// Schemas de Validação
// ==================================
const authSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
type AuthFormData = z.infer<typeof authSchema>;

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

const channelSchema = z.object({
    name: z.string().min(1, "Nome do canal é obrigatório."),
    logo_url: z.string().url("URL do logo inválida.").optional().or(z.literal('')),
});
type ChannelFormData = z.infer<typeof channelSchema>;

const defaultChannelValues: ChannelFormData = {
    name: "",
    logo_url: "",
}


// ==================================
// Componente de Login
// ==================================
function AdminLogin({ onLogin }: { onLogin: (user: SupabaseUser) => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(data: AuthFormData) {
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Conta criada. Verifique seu e-mail para confirmação e faça o login.",
        });
        setIsSignUp(false); // Volta para a tela de login
      }
    } else {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

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
    setLoading(false);
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
            {isSignUp ? <UserPlus className="h-6 w-6 text-primary" /> : <LogIn className="h-6 w-6 text-primary" />}
          </div>
          <h2 className="text-xl font-semibold">{isSignUp ? "Criar Conta de Admin" : "Acesso Restrito"}</h2>
          <p className="text-sm text-white/60">{isSignUp ? "Crie o primeiro usuário administrador" : "Entre com suas credenciais"}</p>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? "Criar Conta" : "Entrar")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary/80 hover:text-primary">
            {isSignUp ? "Já tem uma conta? Entre aqui." : "Não tem uma conta? Crie uma agora."}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================================
// Componente de Formulário
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

function AddChannelForm({
  onChannelAdded,
  onOpenChange,
}: {
  onChannelAdded: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: defaultChannelValues,
  });

  const onSubmit = async (data: ChannelFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("tv_channels").insert([data]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível adicionar o canal: ${error.message}`,
      });
    } else {
      toast({ title: "Sucesso!", description: "Canal adicionado com sucesso." });
      onChannelAdded();
      onOpenChange(false);
      form.reset(defaultChannelValues);
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Canal</DialogTitle>
          <DialogDescription>
            Insira o nome e a URL do logo do canal.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Canal</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Warner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Logo</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            Salvar Canal
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

const TvChannelsContent = () => {
    const [channels, setChannels] = useState<TvChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getChannels = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('tv_channels').select('*').order('name', { ascending: true });
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar canais', description: error.message });
        } else {
            setChannels(data as TvChannel[] ?? []);
        }
        setLoading(false);
    };

    useEffect(() => {
        getChannels();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Canais de TV</h1>
                    <p className="text-white/60">Gerencie os canais disponíveis para os pacotes.</p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Canal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-md">
                        <AddChannelForm 
                            onChannelAdded={getChannels}
                            onOpenChange={setIsModalOpen}
                        />
                    </DialogContent>
                </Dialog>
            </header>
            
            <Card className="border-white/10 bg-neutral-950">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="w-20">Logo</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.map((channel) => (
                                <TableRow key={channel.id} className="border-white/10">
                                    <TableCell>
                                        {channel.logo_url ? (
                                            <Image src={channel.logo_url} alt={channel.name} width={40} height={40} className="rounded-md bg-white/10 p-1"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                                                <Clapperboard className="h-5 w-5 text-white/50"/>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{channel.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {channels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-white/60 py-8">Nenhum canal encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
};

const TvPackagesContent = () => {
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

  
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
           <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Pacote
                </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-2xl">
                 <ChannelPackageForm 
                    onPackageAdded={getPackages}
                    onOpenChange={setIsModalOpen}
                 />
            </DialogContent>
           </Dialog>
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
                        A configuração do banco de dados agora é gerenciada por um script SQL.
                        Para criar as tabelas necessárias, execute o conteúdo do arquivo <code>setup.sql</code> no editor de SQL do seu painel Supabase.
                    </p>
                    <Button asChild variant="outline">
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                            Abrir Painel Supabase
                        </a>
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
  const [activeView, setActiveView] = useState<"plans" | "tv_channels" | "tv_packages" | "database">("plans");
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const navItems = [
    { key: "plans", label: "Planos", icon: LayoutDashboard },
    { key: "tv_channels", label: "Canais de TV", icon: Clapperboard },
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
            {activeView === "tv_channels" && <TvChannelsContent />}
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
  }, []);

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
