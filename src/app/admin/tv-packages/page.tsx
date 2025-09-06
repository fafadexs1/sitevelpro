

"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Loader2, Tv, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChannelPackageForm } from "@/components/admin/ChannelPackageForm";


// ==================================
// Tipagem
// ==================================
type TvPackage = {
    id: string;
    name: string;
    created_at: string;
};


export default function TvPackagesPage() {
    const { toast } = useToast();
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<TvPackage | null>(null);

  
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
    }, [toast]);
  
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
    
    const handleSave = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
        getPackages();
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
                <Button id="new-package-button" onClick={() => setEditingPackage(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Pacote
                </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-2xl">
                 <ChannelPackageForm 
                    pkg={editingPackage}
                    onPackageSaved={handleSave}
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
                  <Tv className="w-5 h-5 text-white/50"/>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-2 text-sm text-white/70">ID: {pkg.id}</p>
              </CardContent>
              <CardFooter className="flex justify-end p-4 border-t border-white/10">
                <Button id={`edit-package-${pkg.id}`} variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingPackage(pkg); setIsModalOpen(true);}}>
                    <Edit className="h-4 w-4 mr-1"/>Editar
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button id={`delete-package-trigger-${pkg.id}`} variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <p className="text-sm text-white/70">
                                Essa ação não pode ser desfeita. Isso irá apagar o pacote e todas as suas associações com canais.
                            </p>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel id={`delete-package-cancel-${pkg.id}`}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction id={`delete-package-confirm-${pkg.id}`} onClick={() => handleDeletePackage(pkg.id)}>
                                Continuar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
           {packages.length === 0 && <p className="text-white/60 col-span-full">Nenhum pacote de TV encontrado.</p>}
        </div>
      </>
    );
};
