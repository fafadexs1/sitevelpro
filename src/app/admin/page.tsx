
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Package,
  Building,
  Edit,
  GripVertical,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  featured_channel_ids: string[] | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
};

type TvChannel = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  created_at: string;
}

// ==================================
// Schemas de Validação
// ==================================
const planSchema = z.object({
  type: z.enum(["residencial", "empresarial"], {
    required_error: "Tipo é obrigatório",
  }),
  speed: z.string().min(1, "Velocidade é obrigatória"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  original_price: z.coerce.number().optional().nullable(),
  features: z.array(z.object({
    icon: z.string().min(1, "Ícone obrigatório"),
    text: z.string().min(1, "Texto obrigatório"),
  })).optional(),
  highlight: z.boolean().default(false),
  has_tv: z.boolean().default(false),
  featured_channel_ids: z.array(z.string()).max(5, "Selecione no máximo 5 canais.").optional(),
  whatsapp_number: z.string().optional().nullable(),
  whatsapp_message: z.string().optional().nullable(),
});

type PlanFormData = z.infer<typeof planSchema>;

const defaultPlanValues = {
  type: "residencial",
  speed: "",
  price: 0,
  original_price: null,
  features: [{ icon: "check", text: "" }],
  highlight: false,
  has_tv: false,
  featured_channel_ids: [],
  whatsapp_number: "",
  whatsapp_message: "Olá, gostaria de saber mais sobre o plano de {{VELOCIDADE}} MEGA.",
};


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
  const [channels, setChannels] = useState<TvChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");

  // Helper para converter de/para o formato do BD
  const fromDbToForm = (features: string[] | null) => {
    if (!features) return [];
    return features.map(f => {
      const parts = f.split(':');
      if (parts.length > 1) {
        return { icon: parts[0].trim(), text: parts.slice(1).join(':').trim() };
      }
      return { icon: 'check', text: f };
    });
  };

  const fromFormToDb = (features?: Array<{icon: string; text: string}>) => {
    if (!features) return [];
    return features.map(f => `${f.icon}: ${f.text}`);
  };

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues:
      mode === "edit" && plan
        ? {
            ...plan,
            price: plan.price ?? 0,
            original_price: plan.original_price ?? undefined,
            features: fromDbToForm(plan.features),
            featured_channel_ids: plan.featured_channel_ids ?? [],
            whatsapp_number: plan.whatsapp_number ?? '',
            whatsapp_message: plan.whatsapp_message ?? defaultPlanValues.whatsapp_message,
          }
        : defaultPlanValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });
  
  const hasTv = form.watch("has_tv");

  useEffect(() => {
    async function getChannels() {
      if (hasTv) {
        setLoadingChannels(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('tv_channels').select('*');
        if (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os canais.' });
        } else {
          setChannels(data as TvChannel[] ?? []);
        }
        setLoadingChannels(false);
      }
    }
    getChannels();
  }, [hasTv, toast]);

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => 
        channel.name.toLowerCase().includes(channelSearch.toLowerCase())
    );
  }, [channels, channelSearch]);


  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();

    const planData = {
      ...data,
      features: fromFormToDb(data.features),
      original_price: data.original_price || null,
      featured_channel_ids: data.has_tv ? data.featured_channel_ids : [],
      whatsapp_number: data.whatsapp_number || null,
      whatsapp_message: data.whatsapp_message || null,
    };

    if (mode === "add") {
      const { error } = await supabase.from("plans").insert([planData]).select('id').single();
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
                      <SelectTrigger id="plan-type">
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
                  <FormLabel>Velocidade (Apenas números)</FormLabel>
                  <FormControl><Input id="plan-speed" placeholder="Ex: 500" {...field} /></FormControl>
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
                      <Input id="plan-price" type="number" step="0.01" placeholder="Ex: 99.90" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
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
                      <Input id="plan-original-price" type="number" step="0.01" placeholder="Ex: 119.90" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <div>
              <FormLabel>Características</FormLabel>
              <div className="mt-2 space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-white/40 flex-shrink-0" />
                    <FormField
                      control={form.control}
                      name={`features.${index}.icon`}
                      render={({ field }) => (
                        <FormItem className="w-1/3">
                          <FormControl>
                            <Input id={`plan-feature-icon-${index}`} placeholder="Ícone (ex: wifi)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`features.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input id={`plan-feature-text-${index}`} placeholder="Texto do benefício" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button id={`plan-feature-remove-${index}`} type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500"/>
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                  id="plan-feature-add"
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => append({ icon: 'check', text: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Adicionar Característica
              </Button>
            </div>
            
            <div className="!mt-6 space-y-4 border-t border-white/10 pt-4">
               <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="highlight"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-x-2 space-y-0">
                      <FormControl><Switch id="plan-highlight" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Destacar plano?</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="has_tv"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-x-2 space-y-0">
                      <FormControl><Switch id="plan-has-tv" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Inclui TV?</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {hasTv && (
                 <AnimatePresence>
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                         <FormField
                            control={form.control}
                            name="featured_channel_ids"
                            render={() => (
                                <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Canais em Destaque</FormLabel>
                                    <p className="text-sm text-white/60">Selecione até 5 canais para destacar neste plano.</p>
                                </div>
                                <div className="relative mb-3">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                                  <Input
                                    id="plan-channel-search"
                                    placeholder="Buscar canal..."
                                    value={channelSearch}
                                    onChange={(e) => setChannelSearch(e.target.value)}
                                    className="pl-9"
                                  />
                                </div>
                                {loadingChannels ? (
                                    <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                ) : (
                                    <ScrollArea className="h-52">
                                        <div className="grid grid-cols-2 gap-2 p-1">
                                        {filteredChannels.map((channel) => (
                                            <FormField
                                            key={channel.id}
                                            control={form.control}
                                            name="featured_channel_ids"
                                            render={({ field }) => {
                                                const isChecked = field.value?.includes(channel.id);
                                                const limitReached = !isChecked && field.value?.length === 5;
                                                return (
                                                <FormItem
                                                    key={channel.id}
                                                    className={`flex flex-row items-center gap-2 space-y-0 rounded-lg border p-3 transition-colors ${limitReached ? 'opacity-50' : 'cursor-pointer'} bg-neutral-900 border-white/10`}
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        id={`plan-channel-checkbox-${channel.id}`}
                                                        checked={isChecked}
                                                        disabled={limitReached}
                                                        onCheckedChange={(checked) => {
                                                        if (limitReached) return;
                                                        return checked
                                                            ? field.onChange([...(field.value ?? []), channel.id])
                                                            : field.onChange(field.value?.filter((value) => value !== channel.id));
                                                        }}
                                                    />
                                                    </FormControl>
                                                    {channel.logo_url && (
                                                    <Image src={channel.logo_url} alt={channel.name} width={24} height={24} className="rounded-sm"/>
                                                    )}
                                                    <FormLabel className={`font-normal text-sm ${limitReached ? '' : 'cursor-pointer'}`}>
                                                    {channel.name}
                                                    </FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                            />
                                        ))}
                                        {filteredChannels.length === 0 && <p className="text-center text-sm text-white/60 py-4">Nenhum canal encontrado.</p>}
                                        </div>
                                    </ScrollArea>
                                )}
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="!mt-6 space-y-4 border-t border-white/10 pt-4">
                <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Contato via WhatsApp</h3>
                <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Número do WhatsApp <span className="text-white/50">(Opcional)</span></FormLabel>
                        <FormControl>
                            <Input id="plan-whatsapp-number" placeholder="5561999998888" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="whatsapp_message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mensagem Padrão <span className="text-white/50">(Opcional)</span></FormLabel>
                        <FormControl>
                            <Textarea id="plan-whatsapp-message" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <p className="text-xs text-white/60">Use {'{{VELOCIDADE}}'} para inserir a velocidade do plano na mensagem.</p>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </div>

          <DialogFooter>
            <Button id="plan-form-cancel" type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button id="plan-form-save" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'add' ? 'Adicionar Plano' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
  );
};



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

  const formatPrice = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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
            <TableCell className="font-medium">{plan.speed} MEGA</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{formatPrice(plan.price)}</span>
                {plan.original_price && (
                  <span className="text-xs text-white/50 line-through">
                    {formatPrice(plan.original_price)}
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
              <Button id={`edit-plan-${plan.id}`} variant="ghost" size="sm" className="mr-2" onClick={() => onEditPlan(plan)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button id={`delete-plan-trigger-${plan.id}`} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser desfeita. Isso irá apagar permanentemente o plano.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel id={`delete-plan-cancel-${plan.id}`}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction id={`delete-plan-confirm-${plan.id}`} onClick={() => onDeletePlan(plan.id)}>
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


export default function PlansPage() {
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
  }, [toast]);

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
            <Button id="add-plan-button">
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
              id="tab-residencial"
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
              id="tab-empresarial"
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
