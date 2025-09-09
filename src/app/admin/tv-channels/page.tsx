
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  PlusCircle,
  Trash2,
  Upload,
  Edit,
  Loader2,
  Clapperboard,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

// ==================================
// Tipagem
// ==================================
type TvChannel = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  is_featured: boolean;
  created_at: string;
}

// ==================================
// Schemas de Validação
// ==================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];


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
                  <Input id="channel-name" placeholder="Ex: Warner" {...field} />
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
                  <Textarea id="channel-description" placeholder="Descreva brevemente o canal..." {...field} />
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
                      <label htmlFor="dropzone-file-add" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 border-gray-300 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-gray-100'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-500"/>
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                              <p className="text-xs text-gray-500">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
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
                 {field.value && <p className="text-sm text-gray-600 mt-2">Arquivo selecionado: {field.value.name}</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              id="add-channel-cancel"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button id="add-channel-save" type="submit">
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
                  <Input id={`edit-channel-name-${channel.id}`} placeholder="Ex: Warner" {...field} />
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
                  <Textarea id={`edit-channel-description-${channel.id}`} placeholder="Descreva brevemente o canal..." {...field} />
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
                    <Image src={channel.logo_url} alt={channel.name} width={40} height={40} className="rounded-md bg-gray-100 p-1 object-contain"/>
                    <p className="text-xs text-gray-600">Logo atual. Envie um novo arquivo abaixo para substituir.</p>
                 </div>
                <FormControl>
                  <div className="relative flex items-center justify-center w-full mt-2">
                      <label htmlFor={`dropzone-file-edit-${channel.id}`} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 border-gray-300 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-gray-100'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-500"/>
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                              <p className="text-xs text-gray-500">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
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
                 {field.value && <p className="text-sm text-gray-600 mt-2">Novo arquivo: {field.value.name}</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              id={`edit-channel-cancel-${channel.id}`}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button id={`edit-channel-save-${channel.id}`} type="submit">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </Form>
  );
}


export default function TvChannelsPage() {
    const { toast } = useToast();
    const [channels, setChannels] = useState<TvChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<TvChannel | null>(null);

    const featuredCount = useMemo(() => channels.filter(c => c.is_featured).length, [channels]);

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
        
        const { error: dbError } = await supabase.from('tv_channels').delete().eq('id', channelId);
        
        if (dbError) {
             toast({ variant: 'destructive', title: 'Erro de Banco de Dados', description: `Não foi possível deletar o canal: ${dbError.message}` });
        } else {
            toast({ title: 'Sucesso', description: 'Canal deletado com sucesso.' });
            getChannels();
        }
    };
    
    const handleToggleFeatured = async (channel: TvChannel) => {
        if (!channel.is_featured && featuredCount >= 10) {
            toast({
                variant: 'destructive',
                title: 'Limite Atingido',
                description: 'Você só pode ter 10 canais em destaque. Desmarque um para adicionar outro.',
            });
            return;
        }

        const supabase = createClient();
        const { error } = await supabase
            .from('tv_channels')
            .update({ is_featured: !channel.is_featured })
            .eq('id', channel.id);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o canal.' });
        } else {
            getChannels();
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Canais de TV</h1>
                    <p className="text-gray-500">Gerencie os canais e marque até 10 como destaque para a página inicial.</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button id="add-channel-button">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Canal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-gray-900 sm:max-w-md">
                        <AddChannelForm 
                            onChannelAdded={getChannels}
                            onOpenChange={setIsAddModalOpen}
                        />
                    </DialogContent>
                </Dialog>
            </header>
            
            <Dialog open={!!editingChannel} onOpenChange={(isOpen) => !isOpen && setEditingChannel(null)}>
                <DialogContent className="bg-white text-gray-900 sm:max-w-md">
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

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-16 text-center">Destaque</TableHead>
                                <TableHead className="w-20">Logo</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.map((channel) => (
                                <TableRow key={channel.id}>
                                     <TableCell className="text-center">
                                        <Button
                                            id={`feature-channel-button-${channel.id}`}
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleFeatured(channel)}
                                            className="mx-auto"
                                        >
                                            <Star className={`h-5 w-5 transition-colors ${channel.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}/>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {channel.logo_url ? (
                                            <Image src={channel.logo_url} alt={channel.name} width={40} height={40} className="rounded-md bg-gray-100 p-1 object-contain"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                <Clapperboard className="h-5 w-5 text-gray-400"/>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-800">{channel.name}</TableCell>
                                    <TableCell className="text-gray-600 text-xs max-w-sm truncate">{channel.description || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button id={`edit-channel-button-${channel.id}`} variant="ghost" size="sm" className="mr-2" onClick={() => setEditingChannel(channel)}>
                                            <Edit className="w-4 h-4 mr-1"/> Editar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button id={`delete-channel-trigger-${channel.id}`} variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-white text-gray-900">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Essa ação não pode ser desfeita. Isso irá apagar permanentemente o canal e seu logo.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel id={`delete-channel-cancel-${channel.id}`}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction id={`delete-channel-confirm-${channel.id}`} onClick={() => handleDeleteChannel(channel.id, channel.logo_url)}>
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
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">Nenhum canal encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
};
