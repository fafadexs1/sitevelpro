
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
  onPackageAdded,
  onOpenChange,
}: {
  onPackageAdded: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    const getChannels = async () => {
      const supabase = createClient();
      setLoadingChannels(true);
      const { data, error } = await supabase.from('tv_channels').select('*');
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os canais.' });
      } else {
        setChannels(data as Channel[] ?? []);
      }
      setLoadingChannels(false);
    };
    getChannels();
  }, [toast]);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      channel_ids: [],
    },
  });

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();

    // 1. Inserir o pacote
    const { data: packageData, error: packageError } = await supabase
      .from('tv_packages')
      .insert({ name: data.name })
      .select('id')
      .single();

    if (packageError || !packageData) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: `Não foi possível criar o pacote: ${packageError?.message}`,
      });
      setIsSubmitting(false);
      return;
    }

    // 2. Inserir as associações na tabela de junção
    const packageChannelRelations = data.channel_ids.map(channelId => ({
      package_id: packageData.id,
      channel_id: channelId,
    }));

    const { error: relationError } = await supabase
      .from('tv_package_channels')
      .insert(packageChannelRelations);

    if (relationError) {
      // Se a relação falhar, idealmente deveríamos deletar o pacote criado.
      // Para simplicidade, apenas exibimos o erro.
      toast({
        variant: 'destructive',
        title: 'Erro de Associação',
        description: `Pacote criado, mas falha ao associar canais: ${relationError.message}`,
      });
    } else {
      toast({ title: 'Sucesso!', description: 'Pacote de canais criado com sucesso.' });
      onPackageAdded();
      onOpenChange(false);
    }

    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Novo Pacote de Canais</DialogTitle>
          <DialogDescription>
            Dê um nome ao pacote e selecione os canais que farão parte dele.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Pacote</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pacote Cinema HD" {...field} />
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
               {loadingChannels ? (
                 <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div>
                ) : (
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
                )}
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
            Salvar Pacote
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
