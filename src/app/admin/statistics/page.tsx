
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart, Users, Repeat, UserPlus, Loader2, File, Eye, MousePointerClick, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Visit = {
  visitor_id: string;
  is_new_visitor: boolean;
  created_at: string;
};

type PageVisit = {
    pathname: string;
    visit_count: number;
}

type RecurringVisitor = {
    visitor_id: string;
    visit_count: number;
    last_visit: string;
}

type DailyVisits = {
    date: string;
    visits: number;
};

type Event = {
    name: string;
    properties: Record<string, any>;
};

type CtaClick = {
    name: string;
    count: number;
};

type FilterRange = 'today' | '7d' | '30d' | 'month';

const filterOptions: { label: string; value: FilterRange }[] = [
    { label: 'Hoje', value: 'today' },
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Este Mês', value: 'month' },
];

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [totalVisits, setTotalVisits] = useState(0);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [newVisitors, setNewVisitors] = useState(0);
    const [topPages, setTopPages] = useState<PageVisit[]>([]);
    const [recurringVisitors, setRecurringVisitors] = useState<RecurringVisitor[]>([]);
    const [dailyVisits, setDailyVisits] = useState<DailyVisits[]>([]);
    const [planClicks, setPlanClicks] = useState<CtaClick[]>([]);
    const [otherClicks, setOtherClicks] = useState<CtaClick[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterRange>('30d');

    const fetchData = useCallback(async (filter: FilterRange) => {
        setLoading(true);
        const supabase = createClient();
        
        let startDate: Date;
        const now = new Date();
        switch (filter) {
            case 'today':
                startDate = subDays(now, 1);
                break;
            case '7d':
                startDate = subDays(now, 7);
                break;
            case 'month':
                startDate = startOfMonth(now);
                break;
            case '30d':
            default:
                startDate = subDays(now, 30);
        }

        const { data: visits, error: visitsError } = await supabase
            .from('visits')
            .select('visitor_id, pathname, is_new_visitor, created_at')
            .gte('created_at', startDate.toISOString());

        if (visitsError) {
            console.error("Error fetching visits:", visitsError);
            setLoading(false);
            return;
        }
        
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('name, properties')
            .eq('name', 'cta_click')
            .gte('created_at', startDate.toISOString());
            
        if (eventsError) {
            console.error("Error fetching events:", eventsError);
        }


        // --- Process Visits Data ---
        setTotalVisits(visits.length);
        const uniqueVisitorIds = new Set(visits.map(v => v.visitor_id));
        setUniqueVisitors(uniqueVisitorIds.size);
        const newVisitorCount = new Set(visits.filter(v => v.is_new_visitor).map(v => v.visitor_id)).size;
        setNewVisitors(newVisitorCount);

        const pageCounts = visits.reduce((acc, visit) => {
            acc[visit.pathname] = (acc[visit.pathname] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const sortedPages = Object.entries(pageCounts).map(([pathname, visit_count]) => ({ pathname, visit_count })).sort((a, b) => b.visit_count - a.visit_count).slice(0, 5);
        setTopPages(sortedPages);
        
        const intervalDays = eachDayOfInterval({ start: startDate, end: now });
        const dailyCounts: Record<string, number> = {};
        intervalDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            dailyCounts[dateStr] = 0;
        });

         visits.forEach(visit => {
            const date = format(new Date(visit.created_at), 'yyyy-MM-dd');
            if (dailyCounts[date] !== undefined) {
                dailyCounts[date]++;
            }
        });
        const chartData = Object.entries(dailyCounts).map(([date, visits]) => ({ date, visits }));
        setDailyVisits(chartData);

        const visitorData: Record<string, { count: number; last_visit: string }> = {};
        visits.forEach(visit => {
            if (!visitorData[visit.visitor_id]) {
                visitorData[visit.visitor_id] = { count: 0, last_visit: '' };
            }
            visitorData[visit.visitor_id].count++;
            if (new Date(visit.created_at) > new Date(visitorData[visit.visitor_id].last_visit || 0)) {
                visitorData[visit.visitor_id].last_visit = visit.created_at;
            }
        });
        const recurring = Object.entries(visitorData).filter(([, data]) => data.count > 1).map(([visitor_id, data]) => ({ visitor_id, visit_count: data.count, last_visit: data.last_visit })).sort((a, b) => b.visit_count - a.visit_count).slice(0, 5);
        setRecurringVisitors(recurring);
        
        // --- Process Events Data ---
        if (events) {
            const planClickCounts = events
                .filter(e => e.properties.plan_name)
                .reduce((acc, e) => {
                    const planKey = `${e.properties.plan_name}`;
                    acc[planKey] = (acc[planKey] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

            const otherClickCounts = events
                .filter(e => e.properties.button_id)
                .reduce((acc, e) => {
                    const buttonKey = e.properties.button_id;
                    acc[buttonKey] = (acc[buttonKey] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

            setPlanClicks(Object.entries(planClickCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
            setOtherClicks(Object.entries(otherClickCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(activeFilter);
    }, [fetchData, activeFilter]);

    const returnRate = uniqueVisitors > 0 ? (((uniqueVisitors - newVisitors) / uniqueVisitors) * 100).toFixed(1) : 0;

    const chartConfig = {
        visits: {
            label: "Visitas",
            color: "hsl(var(--primary))",
        },
    };

    const tickFormatter = (value: string) => {
        if (activeFilter === 'today') {
            return format(new Date(value), "p", { locale: ptBR });
        }
        return format(new Date(value), "d MMM", { locale: ptBR })
    };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><BarChart className="text-primary"/> Estatísticas do Site</h1>
                    <p className="text-gray-500">Análise de tráfego e comportamento dos visitantes.</p>
                </div>
                 <div className="flex shrink-0 rounded-xl bg-card border p-1 text-sm mt-4 sm:mt-0">
                    {filterOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setActiveFilter(opt.value)}
                        className={cn(`rounded-lg px-3 py-1.5 transition-colors text-sm`, 
                            activeFilter === opt.value ? "bg-primary text-primary-foreground" : "text-card-foreground hover:bg-black/5"
                        )}
                    >
                        {opt.label}
                    </button>
                    ))}
                </div>
            </header>
            
            {loading && (
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}

            {!loading && (
            <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
                        <Eye className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalVisits}</div>
                        <p className="text-xs text-gray-500">Soma de todos os page views.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{uniqueVisitors}</div>
                         <p className="text-xs text-gray-500">Número de navegadores distintos.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Visitantes</CardTitle>
                        <UserPlus className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{newVisitors}</div>
                        <p className="text-xs text-gray-500">Visitantes que acessaram pela primeira vez.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
                        <Repeat className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{returnRate}%</div>
                        <p className="text-xs text-gray-500">Percentual de visitantes que retornaram.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Visão Geral das Visitas</CardTitle>
                        <CardDescription>
                            Um panorama diário do tráfego recebido pelo site no período selecionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ChartContainer config={chartConfig} className="w-full h-full">
                            <RechartsBarChart 
                                data={dailyVisits}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                accessibilityLayer
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={8} 
                                    tickFormatter={tickFormatter}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><File className="text-primary"/>Páginas Mais Visitadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Página</TableHead>
                                    <TableHead className="text-right">Visitas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topPages.map(page => (
                                    <TableRow key={page.pathname}>
                                        <TableCell className="font-mono text-sm">{page.pathname}</TableCell>
                                        <TableCell className="text-right font-medium">{page.visit_count}</TableCell>
                                    </TableRow>
                                ))}
                                {topPages.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhuma visita registrada no período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Visitantes Recorrentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>ID do Visitante</TableHead>
                                    <TableHead className="text-center">Visitas</TableHead>
                                    <TableHead className="text-right">Última Visita</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recurringVisitors.map(visitor => (
                                     <TableRow key={visitor.visitor_id}>
                                        <TableCell className="font-mono text-xs truncate max-w-24" title={visitor.visitor_id}>{visitor.visitor_id.split('-')[0]}...</TableCell>
                                        <TableCell className="text-center font-medium">{visitor.visit_count}</TableCell>
                                        <TableCell className="text-right text-xs">{format(new Date(visitor.last_visit), "PPp", { locale: ptBR })}</TableCell>
                                    </TableRow>
                                ))}
                                 {recurringVisitors.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nenhum visitante recorrente no período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 mt-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MousePointerClick className="text-primary"/>Cliques nos Planos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Plano</TableHead><TableHead className="text-right">Cliques</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {planClicks.map(click => (
                                    <TableRow key={click.name}>
                                        <TableCell className="font-medium">{click.name}</TableCell>
                                        <TableCell className="text-right font-medium">{click.count}</TableCell>
                                    </TableRow>
                                ))}
                                {planClicks.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhum clique em planos no período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MousePointerClick className="text-primary"/>Cliques em outros CTAs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Botão</TableHead><TableHead className="text-right">Cliques</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {otherClicks.map(click => (
                                     <TableRow key={click.name}>
                                        <TableCell className="font-medium">{click.name}</TableCell>
                                        <TableCell className="text-right font-medium">{click.count}</TableCell>
                                    </TableRow>
                                ))}
                                {otherClicks.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhum clique em CTAs no período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            </>
            )}
        </>
    );
}
