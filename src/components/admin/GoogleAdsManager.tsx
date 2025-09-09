
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PlusCircle, Trash2, Edit, Tag, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ==================================
// Tipagem e Schemas
// ==================================
export type TrackingTag = {
  id: string;
  name: string;
  script_content: string;
  placement: 'head_start' | 'body_start' | 'body_end';
  is_active: boolean;
  created_at: string;
};

const tagSchema = z.object({
  name: z.string().min(1, "O nome da tag é obrigatório."),
  script_content: z.string().min(1, "O conteúdo do script é obrigatório."),
  placement: z.enum(['head_start', 'body_start', 'body_end'], { required_error: "A posição é obrigatória." }),
  is_active: z.boolean().default(true),
});

type TagFormData = z.infer<typeof tagSchema>;

export type ConversionEvent = {
  id: string;
  name: string;
  type: 'standard' | 'custom';
  selector: string | null;
  event_snippet: string;
  is_active: boolean;
};

const eventSchema = z.object({
  name: z.string().min(1, "O nome do evento é obrigatório."),
  type: z.enum(['standard', 'custom']),
  selector: z.string().optional(),
  event_snippet: z.string().min(1, "O snippet do evento é obrigatório."),
  is_active: z.boolean().default(true),
}).refine(data => data.type !== 'custom' || (data.selector && data.selector.length > 0), {
    message: "O seletor CSS é obrigatório para eventos customizados.",
    path: ["selector"],
});

type EventFormData = z.infer<typeof eventSchema>;

const STANDARD_CONVERSIONS: Omit<ConversionEvent, 'id' | 'is_active' | 'created_at'>[] = [
    { name: 'Clique no WhatsApp', type: 'standard', selector: 'a[href^="https://wa.me"]', event_snippet: "gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID/WhatsApp_Click'});" },
    { name: 'Clique no Telefone', type: 'standard', selector: 'a[href^="tel:"]', event_snippet: "gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID/Phone_Click'});" },
    { name: 'Formulário Enviado (Lead)', type: 'standard', selector: 'form[data-lead-form="true"]', event_snippet: "gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID/Lead_Form_Submit'});" },
];


// ==================================
// Componente de Formulário (Tag)
// ==================================
function TagForm({ onSave, onOpenChange, tag }: { onSave: () => void, onOpenChange: (open: boolean) => void, tag?: TrackingTag | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();
    const mode = tag ? 'edit' : 'add';

    const form = useForm<TagFormData>({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: tag?.name || '',
            script_content: tag?.script_content || '',
            placement: tag?.placement || 'head_start',
            is_active: tag?.is_active ?? true,
        },
    });

    const onSubmit = async (data: TagFormData) => {
        setIsSubmitting(true);
        let error;

        if (mode === 'add') {
            ({ error } = await supabase.from('tracking_tags').insert(data));
        } else if (tag) {
            ({ error } = await supabase.from('tracking_tags').update(data).eq('id', tag.id));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível salvar a tag: ${error.message}` });
        } else {
            toast({ title: 'Sucesso!', description: `Tag ${mode === 'add' ? 'criada' : 'atualizada'}.` });
            onSave();
        }
        setIsSubmitting(false);
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Adicionar Nova Tag' : 'Editar Tag'}</DialogTitle>
                </DialogHeader>
                 <div className="max-h-[65vh] space-y-4 overflow-y-auto p-1 pr-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome da Tag</FormLabel> <FormControl><Input id="tag-form-name" placeholder="Ex: Google Analytics 4" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="script_content" render={({ field }) => ( <FormItem> <FormLabel>Conteúdo do Script</FormLabel> <FormControl><Textarea id="tag-form-script" placeholder="Cole o código da tag aqui, incluindo as tags <script>...</script>" {...field} rows={6} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="placement" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Posição da Tag</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger id="tag-form-placement"><SelectValue placeholder="Selecione onde a tag será inserida" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="head_start">Início do &lt;head&gt;</SelectItem>
                                    <SelectItem value="body_start">Início do &lt;body&gt;</SelectItem>
                                    <SelectItem value="body_end">Fim do &lt;body&gt;</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel>Ativa</FormLabel>
                            <FormControl><Switch id="tag-form-active" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button id="tag-form-cancel" type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button id="tag-form-save" type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

// ==================================
// Componente de Formulário (Evento)
// ==================================
function EventForm({ onSave, onOpenChange, event }: { onSave: () => void, onOpenChange: (open: boolean) => void, event?: ConversionEvent | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();
    const mode = event ? 'edit' : 'add';

    const form = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: event?.name || '',
            type: event?.type || 'custom',
            selector: event?.selector || '',
            event_snippet: event?.event_snippet || '',
            is_active: event?.is_active ?? true,
        },
    });

    const onSubmit = async (data: EventFormData) => {
        setIsSubmitting(true);
        let error;

        if (mode === 'add') {
            ({ error } = await supabase.from('conversion_events').insert(data));
        } else if (event) {
            ({ error } = await supabase.from('conversion_events').update(data).eq('id', event.id));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível salvar o evento: ${error.message}` });
        } else {
            toast({ title: 'Sucesso!', description: `Evento ${mode === 'add' ? 'criado' : 'atualizado'}.` });
            onSave();
        }
        setIsSubmitting(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Adicionar Evento Customizado' : 'Editar Evento'}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[65vh] space-y-4 overflow-y-auto p-1 pr-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome do Evento</FormLabel> <FormControl><Input id="event-form-name" placeholder="Ex: Clique no botão Assinar" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="selector" render={({ field }) => ( <FormItem> <FormLabel>Seletor CSS</FormLabel> <FormControl><Input id="event-form-selector" placeholder="#botao-assinar ou .btn-primary" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="event_snippet" render={({ field }) => ( <FormItem> <FormLabel>Snippet do Evento</FormLabel> <FormControl><Textarea id="event-form-snippet" placeholder="gtag('event', 'conversion', ...)" {...field} rows={4} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel>Ativo</FormLabel>
                            <FormControl><Switch id="event-form-active" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button id="event-form-cancel" type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button id="event-form-save" type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// ==================================
// Abas da Página
// ==================================

function TagsManager() {
    const { toast } = useToast();
    const supabase = createClient();
    
    const [tags, setTags] = useState<TrackingTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TrackingTag | null>(null);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('tracking_tags').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar tags', description: error.message });
        } else {
            setTags(data);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingTag(null);
        fetchTags();
    };
    
    const handleDelete = async (tagId: string) => {
        const { error } = await supabase.from('tracking_tags').delete().eq('id', tagId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao deletar tag', description: error.message });
        } else {
            toast({ title: 'Sucesso', description: 'Tag deletada.' });
            fetchTags();
        }
    }
    
    const handleToggleActive = async (tag: TrackingTag) => {
        const { error } = await supabase
            .from('tracking_tags')
            .update({ is_active: !tag.is_active })
            .eq('id', tag.id);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status da tag.' });
        } else {
            toast({ title: 'Sucesso!', description: `Tag ${!tag.is_active ? 'ativada' : 'desativada'}.` });
            fetchTags();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 max-w-2xl">
                    Adicione scripts como Google Analytics, Meta Pixel, etc. As tags ativas serão injetadas automaticamente nas páginas do seu site, no local que você definir.
                </p>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button id="new-tag-button" onClick={() => { setEditingTag(null); }}><PlusCircle className="mr-2 h-4 w-4" /> Nova Tag</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-gray-900 sm:max-w-2xl">
                      <TagForm onSave={handleSave} onOpenChange={setIsModalOpen} tag={editingTag} />
                  </DialogContent>
                </Dialog>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <Tag className="w-12 h-12 text-gray-400 mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-800">Nenhuma tag criada ainda</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Clique em "Nova Tag" para adicionar seu primeiro script de rastreamento e começar a coletar dados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tags.map((tag) => (
                        <Card key={tag.id} className="flex flex-col">
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Tag className="w-5 h-5 text-primary"/>
                                    {tag.name}
                                </CardTitle>
                                <Switch id={`toggle-tag-${tag.id}`} checked={tag.is_active} onCheckedChange={() => handleToggleActive(tag)} aria-label={`Ativar/desativar tag ${tag.name}`} />
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                 <Badge variant="secondary" className="font-mono text-xs">{tag.placement}</Badge>
                                 <p className="text-xs text-gray-600 line-clamp-2 font-mono bg-gray-100 p-2 rounded-md border border-gray-200">
                                    {tag.script_content}
                                 </p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button id={`edit-tag-${tag.id}`} variant="ghost" size="sm" onClick={() => { setEditingTag(tag); setIsModalOpen(true); }}>
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button id={`delete-tag-trigger-${tag.id}`} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white text-gray-900">
                                        <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá apagar permanentemente a tag.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel id={`delete-tag-cancel-${tag.id}`}>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction id={`delete-tag-confirm-${tag.id}`} onClick={() => handleDelete(tag.id)}>Continuar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function ConversionMappingManager() {
    const { toast } = useToast();
    const supabase = createClient();

    const [events, setEvents] = useState<ConversionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ConversionEvent | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('conversion_events').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar eventos', description: error.message });
        } else {
            setEvents(data);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleToggleActive = async (event: ConversionEvent) => {
        const { error } = await supabase.from('conversion_events').update({ is_active: !event.is_active }).eq('id', event.id);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status.' });
        } else {
            toast({ title: 'Sucesso!', description: `Evento ${!event.is_active ? 'ativado' : 'desativado'}.` });
            fetchEvents();
        }
    };
    
    const handleDelete = async (eventId: string) => {
        const { error } = await supabase.from('conversion_events').delete().eq('id', eventId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao deletar evento', description: error.message });
        } else {
            toast({ title: 'Sucesso', description: 'Evento deletado.' });
            fetchEvents();
        }
    }
    
    const standardEvents = events.filter(e => e.type === 'standard');
    const customEvents = events.filter(e => e.type === 'custom');

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        fetchEvents();
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Conversões Padrão</CardTitle>
                    <CardDescription>Ative ou desative o rastreamento para eventos comuns do site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? <Loader2 className="animate-spin" /> :
                        STANDARD_CONVERSIONS.map(stdEvent => {
                            const dbEvent = standardEvents.find(e => e.selector === stdEvent.selector);
                            const isActive = dbEvent?.is_active ?? false;
                            
                            const handleToggleStandard = async () => {
                                let error;
                                if (dbEvent) {
                                    ({error} = await supabase.from('conversion_events').update({is_active: !dbEvent.is_active}).eq('id', dbEvent.id));
                                } else {
                                    ({error} = await supabase.from('conversion_events').insert({...stdEvent, is_active: true}));
                                }

                                if (error) {
                                    toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível alterar: ${error.message}` });
                                } else {
                                    toast({ title: 'Sucesso!', description: `Evento ${!isActive ? 'ativado' : 'desativado'}.` });
                                    fetchEvents();
                                }
                            }
                            
                            return (
                                <div key={stdEvent.name} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                    <div>
                                        <p className="font-medium text-gray-800">{stdEvent.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{stdEvent.selector}</p>
                                    </div>
                                    <Switch id={`toggle-std-event-${stdEvent.name.replace(/\s/g, '')}`} checked={isActive} onCheckedChange={handleToggleStandard} />
                                </div>
                            );
                        })
                    }
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Eventos Customizados</CardTitle>
                    <CardDescription>Crie eventos de conversão para ações específicas, como cliques em botões.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-end">
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button id="new-custom-event" onClick={() => { setEditingEvent(null); }}><PlusCircle className="mr-2 h-4 w-4" /> Novo Evento Customizado</Button>
                            </DialogTrigger>
                             <DialogContent className="bg-white text-gray-900 sm:max-w-2xl">
                                <EventForm onSave={handleSave} onOpenChange={setIsModalOpen} event={editingEvent} />
                            </DialogContent>
                        </Dialog>
                     </div>
                      {loading ? <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div> :
                        customEvents.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">Nenhum evento customizado criado.</p> :
                        customEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                               <div>
                                   <p className="font-medium text-gray-800">{event.name}</p>
                                   <p className="text-xs text-gray-500 font-mono">Seletor: {event.selector}</p>
                               </div>
                               <div className="flex items-center gap-4">
                                   <Switch id={`toggle-custom-event-${event.id}`} checked={event.is_active} onCheckedChange={() => handleToggleActive(event)} />
                                   <Button id={`edit-custom-event-${event.id}`} variant="ghost" size="sm" onClick={() => { setEditingEvent(event); setIsModalOpen(true); }}><Edit className="h-4 w-4 mr-2"/>Editar</Button>
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button id={`delete-event-trigger-${event.id}`} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white text-gray-900">
                                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Isso irá apagar permanentemente o evento de conversão.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel id={`delete-event-cancel-${event.id}`}>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction id={`delete-event-confirm-${event.id}`} onClick={() => handleDelete(event.id)}>Continuar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </div>
                            </div>
                        ))
                      }
                </CardContent>
            </Card>
        </div>
    );
}

// ==================================
// Página Principal
// ==================================
export function GoogleAdsManager() {
    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rastreamento e Conversões</h1>
                    <p className="text-gray-500">Adicione scripts de marketing e meça os resultados de suas campanhas.</p>
                </div>
            </header>
            
            <Tabs defaultValue="tags" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tags" id="tags-tab"><Tag className="mr-2"/>Gerenciador de Tags</TabsTrigger>
                    <TabsTrigger value="conversions" id="conversions-tab"><Terminal className="mr-2"/>Mapeamento de Conversões</TabsTrigger>
                </TabsList>
                <TabsContent value="tags" className="mt-6">
                    <TagsManager />
                </TabsContent>
                <TabsContent value="conversions" className="mt-6">
                    <ConversionMappingManager />
                </TabsContent>
            </Tabs>
        </>
    );
}
