
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi, Zap,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginWithApi } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";


// =====================================================
// Componente de Logo Dinâmico
// =====================================================
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


const loginSchema = z.object({
  cpfcnpj: z.string().min(1, "CPF ou CNPJ é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type LoginFormData = z.infer<typeof loginSchema>;


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

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { cpfcnpj: "", password: "" },
  });

  async function handleSubmit(data: LoginFormData) {
    setLoading(true);
    const result = await loginWithApi(data.cpfcnpj, data.password);
    
    if (result.success) {
      toast({ title: "Sucesso!", description: "Login realizado com sucesso." });
      onLoginSuccess();
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: result.error,
      });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center">
      <LightningBG />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-6 py-10 absolute top-0 left-0 right-0">
            <Link href="/" className="flex items-center gap-3">
              <DynamicLogo />
            <div>
                <p className="text-lg font-semibold leading-none">Velpro Telecom</p>
                <p className="text-xs text-muted-foreground">Área do Cliente</p>
            </div>
            </Link>
        </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" /> Internet + TV com suporte qualificado
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Bem-vindo à sua <span className="bg-gradient-to-r from-green-300 to-primary bg-clip-text text-transparent">central</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Emita 2ª via, copie PIX, acompanhe faturas e suporte em tempo real. Tudo em um lugar só.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Entrar</h2>
            <p className="text-sm text-muted-foreground">Acesse com seu CPF/CNPJ e senha</p>
          </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cpfcnpj"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="login-document" placeholder="CPF ou CNPJ" {...field} className="pl-9" />
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
                        <FormControl>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="login-password" type={show ? "text" : "password"} placeholder="••••••••" {...field} className="pl-9" />
                            <button id="login-toggle-password" type="button" aria-label="toggle" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2">
                               {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                 />

                <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
                  <label className="inline-flex items-center gap-2"><input id="login-remember" type="checkbox" className="h-3.5 w-3.5 rounded border-border bg-transparent" /> Lembrar</label>
                  <a id="login-forgot-password" className="hover:text-foreground" href="#">Esqueci a senha</a>
                </div>

                <Button id="login-submit" disabled={loading} type="submit" className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Acessar minha conta"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

          <p className="mt-4 text-center text-xs text-muted-foreground">Ao continuar, você concorda com os Termos e a Política de Privacidade.</p>
        </motion.div>
      </div>
    </div>
  );
}
