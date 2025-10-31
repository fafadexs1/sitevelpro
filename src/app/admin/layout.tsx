
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  LogOut,
  Tv,
  UserPlus,
  Clapperboard,
  Globe,
  Megaphone,
  BarChart2,
  Map,
  Play,
  Settings,
  Newspaper,
  ChevronDown,
  Package,
  BookOpen,
  Settings2,
  Brush,
  Network,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { usePathname } from 'next/navigation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";


// ==================================
// Componente de Logo Dinâmico
// ==================================
function DynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'company_logo_url')
        .single();
      
      if (data?.value) {
        setLogoUrl(data.value);
      }
      setLoading(false);
    };
    fetchLogo();
  }, []);

  if (loading) {
    return <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary" />;
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20 overflow-hidden">
      {logoUrl ? (
        <Image src={logoUrl} alt="Logo da Empresa" width={40} height={40} className="object-contain" />
      ) : (
        <Wifi className="h-5 w-5" />
      )}
    </div>
  );
}


// ==================================
// Schemas de Validação
// ==================================
const authSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
type AuthFormData = z.infer<typeof authSchema>;


// ==================================
// Componente de Login
// ==================================
function AdminLogin({ onLogin }: { onLogin: (user: SupabaseUser) => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(data: AuthFormData) {
    setLoading(true);
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
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary p-4">
      <Link href="/" className="mb-8 flex w-fit items-center gap-3">
        <DynamicLogo />
        <div>
          <p className="text-lg font-semibold leading-none text-foreground">Velpro Telecom</p>
          <p className="text-xs text-muted-foreground">Painel Administrativo</p>
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl shadow-gray-200/50"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground">Entre com suas credenciais</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground">E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email-input"
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
                  <FormLabel className="text-card-foreground">Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password-input"
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pl-9 pr-10"
                      />
                      <button
                        id="toggle-password-visibility"
                        type="button"
                        aria-label="toggle"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button id="login-button" disabled={loading} type="submit" className="mt-4 w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Button
            variant="ghost"
            asChild
            className={cn(
                "w-full justify-start gap-2",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            <Link href={href}>
                <Icon className="h-4 w-4" /> {label}
            </Link>
        </Button>
    )
}

const NavGroup = ({ title, icon: Icon, children, startOpen = false }: { title: string; icon: React.ElementType, children: React.ReactNode, startOpen?: boolean }) => (
    <Collapsible defaultOpen={startOpen}>
        <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" /> {title}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div className="py-1 pl-8 pr-2 space-y-1 border-l border-border ml-4">
                {children}
            </div>
        </CollapsibleContent>
    </Collapsible>
)

function AdminDashboard({
  user,
  onLogout,
  children
}: {
  user: SupabaseUser;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const isGroupActive = (paths: string[]) => paths.some(path => pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-secondary text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card p-4 md:flex">
        <div className="mb-8 flex w-fit items-center gap-3">
          <DynamicLogo />
          <div>
            <p className="text-lg font-semibold leading-none text-foreground">Velpro</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        <nav className="flex flex-grow flex-col gap-1">
             <NavGroup title="Conteúdo" icon={BookOpen} startOpen={isGroupActive(['/admin/hero-slides', '/admin/posts', '/admin/seo', '/admin/themes'])}>
                <NavLink href="/admin/hero-slides" label="Slides do Herói" icon={Play} />
                <NavLink href="/admin/posts" label="Artigos" icon={Newspaper} />
                <NavLink href="/admin/seo" label="SEO" icon={Globe} />
                <NavLink href="/admin/themes" label="Aparência" icon={Brush} />
            </NavGroup>
             <NavGroup title="Planos e TV" icon={Package} startOpen={isGroupActive(['/admin/plans', '/admin/tv-channels', '/admin/tv-packages'])}>
                <NavLink href="/admin" label="Planos" icon={LayoutDashboard} />
                <NavLink href="/admin/tv-channels" label="Canais de TV" icon={Clapperboard} />
                <NavLink href="/admin/tv-packages" label="Pacotes de TV" icon={Tv} />
            </NavGroup>
             <NavLink href="/admin/cities" label="Cidades" icon={Map} />
            <NavGroup title="Marketing" icon={Megaphone} startOpen={isGroupActive(['/admin/google-ads', '/admin/statistics', '/admin/popups'])}>
                <NavLink href="/admin/google-ads" label="Google Ads" icon={Megaphone} />
                <NavLink href="/admin/statistics" label="Estatísticas" icon={BarChart2} />
                <NavLink href="/admin/popups" label="Pop-ups" icon={MessageSquare} />
            </NavGroup>
             <NavGroup title="Sistema" icon={Settings2} startOpen={isGroupActive(['/admin/database', '/admin/settings', '/admin/domains'])}>
                <NavLink href="/admin/database" label="Banco de Dados" icon={Database} />
                <NavLink href="/admin/settings" label="Configurações" icon={Settings} />
                 <NavLink href="/admin/domains" label="Domínios" icon={Network} />
            </NavGroup>
        </nav>

        <div className="border-t border-border pt-4">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            <p>Logado como:</p>
            <p className="truncate font-medium text-foreground">{user.email}</p>
          </div>
          <Button
            id="logout-button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


// ==================================
// Componente principal do layout
// ==================================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <AdminDashboard user={user} onLogout={() => setUser(null)}>
      {children}
    </AdminDashboard>
  );
}
