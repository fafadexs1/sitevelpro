
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Megaphone, Save, PlusCircle, Trash2, Edit, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// ==================================
// Tipagem e Schema
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

// ==================================
// Componente de Formulário
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
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome da Tag</FormLabel> <FormControl><Input placeholder="Ex: Google Analytics 4" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="script_content" render={({ field }) => ( <FormItem> <FormLabel>Conteúdo do Script</FormLabel> <FormControl><Textarea placeholder="Cole o código da tag aqui, incluindo as tags <script>...</script>" {...field} rows={6} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="placement" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Posição da Tag</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione onde a tag será inserida" /></SelectTrigger></FormControl>
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
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}


// ==================================
// Página Principal
// ==================================
export default function GoogleAdsPage() {
    const { toast } = useToast();
    const supabase = createClient();
    
    const [tags, setTags] = useState<TrackingTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TrackingTag | null>(null);

    const fetchTags = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('tracking_tags').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar tags', description: error.message });
        } else {
            setTags(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTags();
    }, []);

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


    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciador de Tags</h1>
                    <p className="text-white/60">Adicione e gerencie scripts de rastreamento de marketing e análise.</p>
                </div>
                <Button onClick={() => { setEditingTag(null); setIsModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Nova Tag</Button>
            </header>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-2xl">
                    <TagForm onSave={handleSave} onOpenChange={setIsModalOpen} tag={editingTag} />
                </DialogContent>
            </Dialog>

            <Card className="border-white/10 bg-neutral-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-6 h-6 text-primary"/>
                        Tags de Rastreamento
                    </CardTitle>
                    <CardDescription>
                       Adicione scripts como Google Analytics, Meta Pixel, etc. As tags ativas serão injetadas em todas as páginas do site.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                        <Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead>Nome</TableHead><TableHead>Posição</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {tags.map((tag) => (<TableRow key={tag.id} className="border-white/10"><TableCell className="font-medium">{tag.name}</TableCell><TableCell className="font-mono text-xs">{tag.placement}</TableCell><TableCell><Switch checked={tag.is_active} onCheckedChange={() => handleToggleActive(tag)} /></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingTag(tag); setIsModalOpen(true); }}><Edit className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent className="bg-neutral-950 border-white/10 text-white"><AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá apagar permanentemente a tag.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(tag.id)}>Continuar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
                                {tags.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-white/60 py-8">Nenhuma tag criada.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
