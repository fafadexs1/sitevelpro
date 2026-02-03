
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Brush, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type ThemeSettings = {
    commemorative_theme_enabled: boolean;
};

export default function ThemesPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<ThemeSettings>({ commemorative_theme_enabled: false });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['commemorative_theme_enabled']);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as configurações de tema.' });
        } else {
            const settingsRows = (data as { key: string; value: string | null }[] | null) ?? [];
            const settingsMap = new Map(settingsRows.map((item) => [item.key, item.value ?? ""]));
            setSettings({
                commemorative_theme_enabled: settingsMap.get('commemorative_theme_enabled') === 'true',
            });
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggleCommemorativeTheme = async (enabled: boolean) => {
        setIsSaving(true);
        setSettings(prev => ({ ...prev, commemorative_theme_enabled: enabled }));

        const { error } = await supabase
            .from('system_settings')
            .upsert({ key: 'commemorative_theme_enabled', value: String(enabled) });

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
            // Reverte a alteração visual em caso de erro
            setSettings(prev => ({ ...prev, commemorative_theme_enabled: !enabled }));
        } else {
            toast({ title: 'Sucesso!', description: `Tema comemorativo ${enabled ? 'ativado' : 'desativado'}.` });
        }
        setIsSaving(false);
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Aparência do Site</h1>
                <p className="text-muted-foreground">Gerencie temas e a aparência visual do seu site de vendas.</p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Temas Sazonais</CardTitle>
                            <CardDescription>Ative temas especiais para datas comemorativas como Halloween, Natal, etc.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="commemorative-theme-switch" className="text-base font-medium">
                                        Tema Comemorativo
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Atualmente: <span className="font-semibold text-red-500">Natal 🎄</span>.
                                    </p>
                                </div>
                                <Switch
                                    id="commemorative-theme-switch"
                                    checked={settings.commemorative_theme_enabled}
                                    onCheckedChange={handleToggleCommemorativeTheme}
                                    disabled={isSaving}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-muted-foreground"><Brush /> Paleta de Cores</CardTitle>
                            <CardDescription>Personalize as cores primárias e de fundo do seu site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-sm text-muted-foreground py-8">
                                Em breve.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
