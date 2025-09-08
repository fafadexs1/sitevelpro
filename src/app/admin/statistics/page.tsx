
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart, Users, Repeat, UserPlus, Loader2, File, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [totalVisits, setTotalVisits] = useState(0);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [newVisitors, setNewVisitors] = useState(0);
    const [topPages, setTopPages] = useState<PageVisit[]>([]);
    const [recurringVisitors, setRecurringVisitors] = useState<RecurringVisitor[]>([]);
    const [dailyVisits, setDailyVisits] = useState<DailyVisits[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const supabase = createClient();

            // Fetch all visits in the last 30 days
            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
            const { data: visits, error } = await supabase
                .from('visits')
                .select('visitor_id, pathname, is_new_visitor, created_at')
                .gte('created_at', thirtyDaysAgo);

            if (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
                return;
            }

            // Calculate KPIs
            setTotalVisits(visits.length);
            const uniqueVisitorIds = new Set(visits.map(v => v.visitor_id));
            setUniqueVisitors(uniqueVisitorIds.size);
            const newVisitorCount = new Set(visits.filter(v => v.is_new_visitor).map(v => v.visitor_id)).size;
            setNewVisitors(newVisitorCount);

            // Calculate Top Pages
            const pageCounts = visits.reduce((acc, visit) => {
                acc[visit.pathname] = (acc[visit.pathname] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const sortedPages = Object.entries(pageCounts)
                .map(([pathname, visit_count]) => ({ pathname, visit_count }))
                .sort((a, b) => b.visit_count - a.visit_count)
                .slice(0, 5);
            setTopPages(sortedPages);
            
            // Calculate Daily Visits for Chart
            const dailyCounts: Record<string, number> = {};
            for (let i = 29; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                dailyCounts[date] = 0;
            }
             visits.forEach(visit => {
                const date = format(new Date(visit.created_at), 'yyyy-MM-dd');
                if (dailyCounts[date] !== undefined) {
                    dailyCounts[date]++;
                }
            });
            const chartData = Object.entries(dailyCounts).map(([date, visits]) => ({ date, visits }));
            setDailyVisits(chartData);


            // Calculate Recurring Visitors
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
            const recurring = Object.entries(visitorData)
                .filter(([, data]) => data.count > 1)
                .map(([visitor_id, data]) => ({ visitor_id, visit_count: data.count, last_visit: data.last_visit }))
                .sort((a, b) => b.visit_count - a.visit_count)
                .slice(0, 5);
            setRecurringVisitors(recurring);

            setLoading(false);
        }

        fetchData();
    }, []);

    const returnRate = uniqueVisitors > 0 ? (((uniqueVisitors - newVisitors) / uniqueVisitors) * 100).toFixed(1) : 0;

    const chartConfig = {
        visits: {
            label: "Visitas",
            color: "hsl(var(--primary))",
        },
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart className="text-primary"/> Estatísticas do Site</h1>
                    <p className="text-white/60">Análise de tráfego e comportamento dos visitantes nos últimos 30 dias.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
                        <Eye className="h-4 w-4 text-white/50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalVisits}</div>
                        <p className="text-xs text-white/60">Soma de todos os page views.</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-white/50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{uniqueVisitors}</div>
                         <p className="text-xs text-white/60">Número de navegadores distintos.</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Visitantes</CardTitle>
                        <UserPlus className="h-4 w-4 text-white/50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{newVisitors}</div>
                        <p className="text-xs text-white/60">Visitantes que acessaram pela primeira vez.</p>
                    </CardContent>
                </Card>
                 <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
                        <Repeat className="h-4 w-4 text-white/50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{returnRate}%</div>
                        <p className="text-xs text-white/60">Percentual de visitantes que retornaram.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader>
                        <CardTitle>Visão Geral das Visitas (Últimos 30 Dias)</CardTitle>
                        <CardDescription>
                            Um panorama diário do tráfego recebido pelo site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ChartContainer config={chartConfig} className="w-full h-full">
                            <RechartsBarChart 
                                data={dailyVisits}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                accessibilityLayer
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={8} 
                                    tickFormatter={(value) => format(new Date(value), "d MMM", { locale: ptBR })} 
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
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
                <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><File className="text-primary"/>Páginas Mais Visitadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead>Página</TableHead>
                                    <TableHead className="text-right">Visitas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topPages.map(page => (
                                    <TableRow key={page.pathname} className="border-white/10">
                                        <TableCell className="font-mono text-sm">{page.pathname}</TableCell>
                                        <TableCell className="text-right font-medium">{page.visit_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="border-white/10 bg-neutral-900/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Visitantes Recorrentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead>ID do Visitante</TableHead>
                                    <TableHead className="text-center">Visitas</TableHead>
                                    <TableHead className="text-right">Última Visita</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recurringVisitors.map(visitor => (
                                     <TableRow key={visitor.visitor_id} className="border-white/10">
                                        <TableCell className="font-mono text-xs truncate max-w-24" title={visitor.visitor_id}>{visitor.visitor_id.split('-')[0]}...</TableCell>
                                        <TableCell className="text-center font-medium">{visitor.visit_count}</TableCell>
                                        <TableCell className="text-right text-xs">{format(new Date(visitor.last_visit), "PPp", { locale: ptBR })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
