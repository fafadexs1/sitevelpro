
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
  Upload,
  Edit,
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Textarea } from "@/components/ui/textarea";

// ==================================
// Tipagem
// ==================================
type Plan = {
  id: string;
  type: "residencial" | "empresarial";
  speed: string;
  price: number;
  original_price: number | null;
  features: string[] | null;
  highlight: boolean;
  has_tv: boolean;
};

type TvChannel = {
  id: string;
  name: string;
  description: string | null;
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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

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
  original_price: z.coerce.number().optional().nullable(),
  features: z.string().optional(),
  highlight: z.boolean().default(false),
  has_tv: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

const defaultPlanValues = {
  type: "residencial",
  speed: "",
  price: 0,
  original_price: null,
  features: "",
  highlight: false,
  has_tv: false,
};

const channelSchema = z.object({
    name: z.string().min(1, "Nome do canal é obrigatório."),
    description: z.string().optional(),
    logo_file: z.any()
        .refine((file) => file instanceof File, "Logo é obrigatório.")
        .refine((file) => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB.`)
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas .jpg, .jpeg, .png, .svg e .webp são permitidos."),
});
type ChannelFormData = z.infer<typeof channelSchema>;

const editChannelSchema = z.object({
    name: z.string().min(1, "Nome do canal é obrigatório."),
    description: z.string().optional(),
    logo_file: z.any()
        .optional() // Opcional na edição
        .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), `Tamanho máximo de 5MB.`)
        .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), "Apenas .jpg, .jpeg, .png, .svg e .webp são permitidos."),
});
type EditChannelFormData = z.infer<typeof editChannelSchema>;


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
const PlanForm = ({
  mode,
  plan,
  onPlanAdded,
  onPlanEdited,
  onOpenChange,
}: {
  mode: "add" | "edit";
  plan?: Plan | null;
  onPlanAdded?: () => void;
  onPlanEdited?: () => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues:
      mode === "edit" && plan
        ? {
            ...plan,
            original_price: plan.original_price ?? undefined,
            features: (plan.features ?? []).join("\n"),
          }
        : defaultPlanValues,
  });

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();

    const planData = {
      ...data,
      features: data.features?.split("\n").filter(Boolean) ?? [],
      original_price: data.original_price || null,
    };

    if (mode === "add") {
      const { error } = await supabase.from("plans").insert([planData]);
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: `Não foi possível adicionar o plano: ${error.message}` });
      } else {
        toast({ title: "Sucesso!", description: "Plano adicionado." });
        onPlanAdded?.();
      }
    } else if (mode === "edit" && plan) {
      const { error } = await supabase.from("plans").update(planData).eq("id", plan.id);
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: `Não foi possível editar o plano: ${error.message}` });
      } else {
        toast({ title: "Sucesso!", description: "Plano editado." });
        onPlanEdited?.();
      }
    }

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Adicionar Novo Plano' : 'Editar Plano'}</DialogTitle>
            <DialogDescription>
              {mode === 'add' ? 'Preencha os detalhes do novo plano.' : 'Modifique os detalhes do plano existente.'}
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
                  <FormControl><Input placeholder="Ex: 500 Mega" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 99.90" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Original <span className="text-white/50">(Opcional)</span></FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 119.90" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Características <span className="text-white/50">(Uma por linha)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder={"Wi-Fi 6\n200k de Upload\nSuporte 24/7"} {...field} />
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
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer">Destacar plano?</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_tv"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer">Inclui TV?</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'add' ? 'Adicionar Plano' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
  );
};


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
    defaultValues: { name: "", description: "", logo_file: null },
  });

  const onSubmit = async (data: ChannelFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const file = data.logo_file;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload da imagem para o Storage
    const { error: uploadError } = await supabase.storage
        .from('canais')
        .upload(filePath, file);

    if (uploadError) {
        toast({ variant: "destructive", title: "Erro de Upload", description: uploadError.message });
        setIsSubmitting(false);
        return;
    }

    // 2. Obter a URL pública da imagem
    const { data: publicUrlData } = supabase.storage
        .from('canais')
        .getPublicUrl(filePath);

    if (!publicUrlData) {
        toast({ variant: "destructive", title: "Erro de URL", description: "Não foi possível obter a URL pública do arquivo." });
        setIsSubmitting(false);
        return;
    }

    // 3. Inserir os dados na tabela 'tv_channels'
    const { error: insertError } = await supabase.from("tv_channels").insert([{ 
        name: data.name,
        description: data.description,
        logo_url: publicUrlData.publicUrl 
    }]);

    if (insertError) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: `Não foi possível adicionar o canal: ${insertError.message}`,
      });
    } else {
      toast({ title: "Sucesso!", description: "Canal adicionado com sucesso." });
      onChannelAdded();
      onOpenChange(false);
      form.reset();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isSubmitting} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Canal</DialogTitle>
            <DialogDescription>
              Insira os detalhes do canal e faça o upload do logo.
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva brevemente o canal..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo do Canal</FormLabel>
                <FormControl>
                  <div className="relative flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file-add" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-neutral-900 border-white/20 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-neutral-800'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-white/50"/>
                              <p className="mb-2 text-sm text-white/50"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                              <p className="text-xs text-white/50">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
                          </div>
                          <Input 
                              id="dropzone-file-add" 
                              type="file" 
                              className="hidden"
                              accept={ACCEPTED_IMAGE_TYPES.join(',')}
                              onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                           />
                      </label>
                  </div> 
                </FormControl>
                 {field.value && <p className="text-sm text-white/70 mt-2">Arquivo selecionado: {field.value.name}</p>}
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
            <Button type="submit">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Canal
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </Form>
  );
}


function EditChannelForm({
  channel,
  onChannelEdited,
  onOpenChange,
}: {
  channel: TvChannel;
  onChannelEdited: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditChannelFormData>({
    resolver: zodResolver(editChannelSchema),
    defaultValues: {
      name: channel.name,
      description: channel.description || "",
      logo_file: null,
    },
  });

  const onSubmit = async (data: EditChannelFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    let newLogoUrl = channel.logo_url;

    // 1. Se um novo logo foi enviado, faça o upload
    if (data.logo_file) {
        const file = data.logo_file;
        const fileExt = file.name.split('.').pop();
        const newFileName = `${Math.random()}.${fileExt}`;
        const newFilePath = `${newFileName}`;

        // Deleta o logo antigo
        if (channel.logo_url) {
            const oldFilePath = new URL(channel.logo_url).pathname.split('/canais/').pop();
            if (oldFilePath) {
                await supabase.storage.from('canais').remove([oldFilePath]);
            }
        }

        // Upload do novo logo
        const { error: uploadError } = await supabase.storage.from('canais').upload(newFilePath, file);
        if (uploadError) {
            toast({ variant: "destructive", title: "Erro de Upload", description: uploadError.message });
            setIsSubmitting(false);
            return;
        }

        // Obtém a nova URL pública
        const { data: publicUrlData } = supabase.storage.from('canais').getPublicUrl(newFilePath);
        newLogoUrl = publicUrlData!.publicUrl;
    }

    // 2. Atualiza os dados na tabela 'tv_channels'
    const { error: updateError } = await supabase
        .from("tv_channels")
        .update({
            name: data.name,
            description: data.description,
            logo_url: newLogoUrl,
        })
        .eq("id", channel.id);

    if (updateError) {
        toast({
            variant: "destructive",
            title: "Erro ao Atualizar",
            description: `Não foi possível atualizar o canal: ${updateError.message}`,
        });
    } else {
        toast({ title: "Sucesso!", description: "Canal atualizado com sucesso." });
        onChannelEdited();
        onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isSubmitting} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Editar Canal</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do canal. Envie um novo logo para substituí-lo.
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva brevemente o canal..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Substituir Logo (Opcional)</FormLabel>
                 <div className="flex items-center gap-4">
                    <Image src={channel.logo_url} alt={channel.name} width={40} height={40} className="rounded-md bg-white/10 p-1 object-contain"/>
                    <p className="text-xs text-white/60">Logo atual. Envie um novo arquivo abaixo para substituir.</p>
                 </div>
                <FormControl>
                  <div className="relative flex items-center justify-center w-full mt-2">
                      <label htmlFor={`dropzone-file-edit-${channel.id}`} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-neutral-900 border-white/20 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-neutral-800'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-white/50"/>
                              <p className="mb-2 text-sm text-white/50"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                              <p className="text-xs text-white/50">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
                          </div>
                          <Input 
                              id={`dropzone-file-edit-${channel.id}`}
                              type="file" 
                              className="hidden"
                              accept={ACCEPTED_IMAGE_TYPES.join(',')}
                              onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                           />
                      </label>
                  </div> 
                </FormControl>
                 {field.value && <p className="text-sm text-white/70 mt-2">Novo arquivo: {field.value.name}</p>}
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
            <Button type="submit">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </fieldset>
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
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const getPlans = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar planos', description: error.message });
      console.error("Erro ao buscar planos:", error);
    } else {
      setPlans((data as Plan[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPlans();
  }, []);

  const filteredPlans = useMemo(() => plans.filter((p) => p.type === activeTab), [plans, activeTab]);

  const handlePlanAdded = () => {
    getPlans();
  };

  const handlePlanEdited = () => {
    setEditingPlan(null);
    getPlans();
  };

  const handleDeletePlan = async (planId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível deletar o plano: ${error.message}` });
    } else {
      toast({ title: 'Sucesso', description: 'Plano deletado.' });
      getPlans();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
          <p className="text-white/60">Adicione, edite ou remova os planos exibidos no site.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-xl">
            <PlanForm mode="add" onPlanAdded={handlePlanAdded} onOpenChange={setIsAddModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={!!editingPlan} onOpenChange={(isOpen) => !isOpen && setEditingPlan(null)}>
        <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-xl">
          {editingPlan && (
            <PlanForm
              mode="edit"
              plan={editingPlan}
              onPlanEdited={handlePlanEdited}
              onOpenChange={(isOpen) => !isOpen && setEditingPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>


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
                <PlansTable
                  plans={filteredPlans}
                  onEditPlan={setEditingPlan}
                  onDeletePlan={handleDeletePlan}
                />
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<TvChannel | null>(null);


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

    const handleDeleteChannel = async (channelId: string, logoUrl: string) => {
        const supabase = createClient();

        // 1. Deletar do Storage, se houver logo
        if (logoUrl) {
            const filePath = new URL(logoUrl).pathname.split('/canais/').pop();
            if(filePath) {
                const { error: storageError } = await supabase.storage.from('canais').remove([filePath]);
                 if (storageError) {
                    toast({ variant: 'destructive', title: 'Erro de Storage', description: `Não foi possível deletar o logo: ${storageError.message}` });
                    return;
                }
            }
        }
        
        // 2. Deletar do banco de dados
        const { error: dbError } = await supabase.from('tv_channels').delete().eq('id', channelId);
        
        if (dbError) {
             toast({ variant: 'destructive', title: 'Erro de Banco de Dados', description: `Não foi possível deletar o canal: ${dbError.message}` });
        } else {
            toast({ title: 'Sucesso', description: 'Canal deletado com sucesso.' });
            getChannels(); // Refresh
        }
    };


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
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Canal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-md">
                        <AddChannelForm 
                            onChannelAdded={getChannels}
                            onOpenChange={setIsAddModalOpen}
                        />
                    </DialogContent>
                </Dialog>
            </header>
            
            <Dialog open={!!editingChannel} onOpenChange={(isOpen) => !isOpen && setEditingChannel(null)}>
                <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-md">
                    {editingChannel && (
                        <EditChannelForm
                            channel={editingChannel}
                            onChannelEdited={() => {
                                setEditingChannel(null);
                                getChannels();
                            }}
                            onOpenChange={(isOpen) => !isOpen && setEditingChannel(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Card className="border-white/10 bg-neutral-950">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="w-20">Logo</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.map((channel) => (
                                <TableRow key={channel.id} className="border-white/10">
                                    <TableCell>
                                        {channel.logo_url ? (
                                            <Image src={channel.logo_url} alt={channel.name} width={40} height={40} className="rounded-md bg-white/10 p-1 object-contain"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                                                <Clapperboard className="h-5 w-5 text-white/50"/>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{channel.name}</TableCell>
                                    <TableCell className="text-white/70 text-xs max-w-sm truncate">{channel.description || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => setEditingChannel(channel)}>
                                            <Edit className="w-4 h-4 mr-1"/> Editar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-white/70">
                                                        Essa ação não pode ser desfeita. Isso irá apagar permanentemente o canal e seu logo.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteChannel(channel.id, channel.logo_url)}>
                                                        Continuar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {channels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-white/60 py-8">Nenhum canal encontrado.</TableCell>
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
  
     const handleDeletePackage = async (packageId: string) => {
        const supabase = createClient();
        
        // 1. Deletar as associações na tabela de junção
        const { error: relationError } = await supabase.from('tv_package_channels').delete().eq('package_id', packageId);
        if (relationError) {
            toast({ variant: 'destructive', title: 'Erro de Associação', description: `Não foi possível remover associações: ${relationError.message}` });
            return;
        }

        // 2. Deletar o pacote em si
        const { error: packageError } = await supabase.from('tv_packages').delete().eq('id', packageId);
        if (packageError) {
            toast({ variant: 'destructive', title: 'Erro de Banco de Dados', description: `Não foi possível deletar o pacote: ${packageError.message}` });
        } else {
            toast({ title: 'Sucesso', description: 'Pacote deletado com sucesso.' });
            getPackages(); // Refresh
        }
    };

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
            <Card key={pkg.id} className="border-white/10 bg-neutral-900/60 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pkg.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-2 text-sm text-white/70">ID: {pkg.id}</p>
                {/* Channel logos will be added later */}
              </CardContent>
              <div className="flex justify-end p-4 border-t border-white/10">
                <Button variant="ghost" size="sm" className="mr-2">Editar</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                                Essa ação não pode ser desfeita. Isso irá apagar o pacote e todas as suas associações com canais.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePackage(pkg.id)}>
                                Continuar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
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

const { toast } = useToast();

function PlansTable({
  plans,
  onEditPlan,
  onDeletePlan,
}: {
  plans: Plan[];
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (planId: string) => void;
}) {
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
            <TableCell>
              <div className="flex items-center gap-2">
                <span>R$ {Number(plan.price || 0).toFixed(2)}</span>
                {plan.original_price && (
                  <span className="text-xs text-white/50 line-through">
                    R$ {Number(plan.original_price).toFixed(2)}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              {plan.highlight && (
                <Badge className="border-primary/30 bg-primary/20 text-primary">Sim</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="mr-2" onClick={() => onEditPlan(plan)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm"><Trash2 className="w-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      Essa ação não pode ser desfeita. Isso irá apagar permanentemente o plano.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeletePlan(plan.id)}>
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
  }, [supabase.auth]);

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
