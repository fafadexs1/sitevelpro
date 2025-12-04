"use client";

import React from "react";
import { DragDropContext, Draggable, OnDragEndResponder } from "react-beautiful-dnd";
import { Droppable } from "@/components/admin/Droppable";
import {
    Edit,
    Trash2,
    GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "@/types/admin";

export function PlansTable({
    plans,
    setPlans,
    onEditPlan,
    onDeletePlan,
}: {
    plans: Plan[];
    setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
    onEditPlan: (plan: Plan) => void;
    onDeletePlan: (planId: string) => void;
}) {
    const { toast } = useToast();

    if (!plans || plans.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Nenhum plano deste tipo encontrado.</div>;
    }

    const handleOnDragEnd: OnDragEndResponder = async (result) => {
        if (!result.destination) return;

        const items = Array.from(plans);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update sort_order based on new position
        const updatedPlans = items.map((plan, index) => ({
            ...plan,
            sort_order: index,
        }));

        setPlans(updatedPlans); // Optimistic update

        // Update Supabase
        const supabase = createClient();
        const updates = updatedPlans.map(p => ({ id: p.id, sort_order: p.sort_order }));

        const { error } = await supabase.from('plans').upsert(updates);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao reordenar', description: 'Não foi possível salvar a nova ordem.' });
            setPlans(plans); // Revert on error
        } else {
            toast({ title: 'Sucesso!', description: 'Ordem dos planos atualizada.' });
        }
    };


    const formatPrice = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return "N/A";
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="plans">
                {(provided) => (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[150px]">Velocidade</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead className="text-center">Destaque</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                            {plans.map((plan, index) => (
                                <Draggable key={plan.id} draggableId={plan.id} index={index}>
                                    {(provided, snapshot) => (
                                        <TableRow
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`group transition-colors hover:bg-muted/50 ${snapshot.isDragging ? "bg-muted shadow-lg" : ""}`}
                                        >
                                            <TableCell className="cursor-grab">
                                                <GripVertical className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">{plan.speed}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground font-semibold">{formatPrice(plan.price)}</span>
                                                    {plan.original_price && (
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            {formatPrice(plan.original_price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {plan.highlight && (
                                                    <Badge className="border-primary/30 bg-primary/20 text-primary hover:bg-primary/30">Destaque</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button id={`edit-plan-${plan.id}`} variant="ghost" size="sm" className="mr-2 hover:bg-primary/10 hover:text-primary" onClick={() => onEditPlan(plan)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button id={`delete-plan-trigger-${plan.id}`} variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-background text-foreground border-border">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Essa ação não pode ser desfeita. Isso irá apagar permanentemente o plano.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel id={`delete-plan-cancel-${plan.id}`}>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction id={`delete-plan-confirm-${plan.id}`} onClick={() => onDeletePlan(plan.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Continuar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </TableBody>
                    </Table>
                )}
            </Droppable>
        </DragDropContext>
    );
}
