

"use client";

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

type TvPackage = {
    id: string;
    name: string;
};

type Channel = {
  id: string;
  name: string;
  logo_url: string | null;
};

const packageSchema = z.object({
  name: z.string().min(3, 'O nome do pacote é obrigatório.'),
  channel_ids: z.array(z.string()).min(1, 'Selecione ao menos um canal.'),
});

type PackageFormData = z.infer<typeof packageSchema>;

export function ChannelPackageForm({
  pkg,
  onPackageSaved,
  onOpenChange,
}: {
  pkg: TvPackage | null;
  onPackageSaved: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const mode = pkg ? 'edit' : 'add';

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      channel_ids: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: channelsData, error: channelsError } = await supabase.from('tv_channels').select('id, name, logo_url');
        
        if (channelsError) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os canais.' });
        } else {
            setChannels(channelsData as Channel[] ?? []);
        }

        if (mode === 'edit' && pkg) {
            form.setValue('name', pkg.name);
            const { data: relations, error: relationsError } = await supabase
                .from('tv_package_channels')
                .select('channel_id')
                .eq('package_id', pkg.id);
            
            if (relationsError) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os canais do pacote.' });
            } else {
                form.setValue('channel_ids', relations.map(r => r.channel_id));
            }
        }
        setLoading(false);
    };
    fetchData();
  }, [toast, mode, pkg, form]);

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();

    if (mode === 'add') {
        // 1. Inserir o pacote
        const { data: packageData, error: packageError } = await supabase
            .from('tv_packages')
            .insert({ name: data.name })
            .select('id')
            .single();

        if (packageError || !packageData) {
            toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível criar o pacote: ${packageError?.message}` });
            setIsSubmitting(false);
            return;
        }

        // 2. Inserir associações
        const packageChannelRelations = data.channel_ids.map(channelId => ({
            package_id: packageData.id,
            channel_id: channelId,
        }));
        const { error: relationError } = await supabase.from('tv_package_channels').insert(packageChannelRelations);
        if (relationError) {
            toast({ variant: 'destructive', title: 'Erro de Associação', description: `Pacote criado, mas falha ao associar canais: ${relationError.message}` });
        } else {
            toast({ title: 'Sucesso!', description: 'Pacote criado.' });
            onPackageSaved();
        }

    } else if (mode === 'edit' && pkg) {
        // 1. Atualizar nome
        const { error: packageError } = await supabase.from('tv_packages').update({ name: data.name }).eq('id', pkg.id);
        if (packageError) {
             toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível atualizar o pacote: ${packageError.message}` });
             setIsSubmitting(false);
             return;
        }

        // 2. Sincronizar associações
        // Deleta as antigas
        await supabase.from('tv_package_channels').delete().eq('package_id', pkg.id);
        // Insere as novas
        const packageChannelRelations = data.channel_ids.map(channelId => ({
            package_id: pkg.id,
            channel_id: channelId,
        }));
        const { error: relationError } = await supabase.from('tv_package_channels').insert(packageChannelRelations);
        
        if (relationError) {
            toast({ variant: 'destructive', title: 'Erro de Associação', description: `Falha ao atualizar canais: ${relationError.message}` });
        } else {
            toast({ title: 'Sucesso!', description: 'Pacote atualizado.' });
            onPackageSaved();
        }
    }
    
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Novo Pacote de Canais' : `Editar Pacote: ${pkg?.name}`}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Dê um nome ao pacote e selecione os canais.' : 'Modifique o nome ou os canais do pacote.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
        <>
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome do Pacote</FormLabel>
                <FormControl>
                    <Input id="package-name" placeholder="Ex: Pacote Cinema HD" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="channel_ids"
            render={() => (
                <FormItem>
                <div className="mb-4">
                    <FormLabel className="text-base">Canais</FormLabel>
                </div>
                <ScrollArea className="h-64">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1">
                    {channels.map((channel) => (
                        <FormField
                        key={channel.id}
                        control={form.control}
                        name="channel_ids"
                        render={({ field }) => (
                            <FormItem
                            key={channel.id}
                            className="flex flex-row items-center gap-2 space-y-0 rounded-lg border p-3 bg-neutral-900 border-white/10"
                            >
                            <FormControl>
                                <Checkbox
                                    id={`channel-checkbox-${channel.id}`}
                                    checked={field.value?.includes(channel.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...field.value, channel.id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== channel.id
                                            )
                                        );
                                    }}
                                />
                            </FormControl>
                            {channel.logo_url && (
                                <Image src={channel.logo_url} alt={channel.name} width={24} height={24} className="rounded-sm"/>
                            )}
                            <FormLabel className="font-normal text-sm cursor-pointer">
                                {channel.name}
                            </FormLabel>
                            </FormItem>
                        )}
                        />
                    ))}
                    </div>
                </ScrollArea>
                <FormMessage />
                </FormItem>
            )}
            />
        </>
        )}


        <DialogFooter>
          <Button
            id="package-form-cancel"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button id="package-form-save" type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
