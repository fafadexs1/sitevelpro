"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Loader2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "@/types/admin";
import { PlanForm } from "@/components/admin/plans/PlanForm";
import { PlansTable } from "@/components/admin/plans/PlansTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const { data, error } = await supabase.from("plans").select("*").order("sort_order", { ascending: true }).order("price", { ascending: true });

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

  const setFilteredPlans = (newPlans: Plan[]) => {
    const otherPlans = plans.filter(p => p.type !== activeTab);
    const combined = [...otherPlans, ...newPlans].sort((a, b) => a.sort_order - b.sort_order);
    setPlans(combined);
  };

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Gerenciar Planos</h1>
          <p className="text-muted-foreground mt-1">Configure os planos de internet exibidos no site.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background text-foreground border-border">
            <PlanForm mode="add" onPlanAdded={handlePlanAdded} onOpenChange={setIsAddModalOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listagem de Planos</CardTitle>
              <CardDescription>Arraste para reordenar os planos.</CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="residencial">Residencial</TabsTrigger>
                <TabsTrigger value="empresarial">Empresarial</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PlansTable
              plans={filteredPlans}
              setPlans={setFilteredPlans}
              onEditPlan={(plan) => setEditingPlan(plan)}
              onDeletePlan={handleDeletePlan}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição (controlado pelo estado editingPlan) */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background text-foreground border-border">
          {editingPlan && (
            <PlanForm
              mode="edit"
              plan={editingPlan}
              onPlanEdited={handlePlanEdited}
              onOpenChange={(open) => !open && setEditingPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
