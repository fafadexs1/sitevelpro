

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart, Users, Repeat, UserPlus, Loader2, File, Eye, MousePointerClick, CalendarDays, Calendar as CalendarIcon, ExternalLink, Globe, Clock, ArrowRight, Gauge, ChevronDown, ChevronRightIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, eachHourOfInterval, endOfDay, addDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Visit = {
  id: string;
  visitor_id: string;
  hostname: string;
  pathname: string;
  is_new_visitor: boolean;
  created_at: string;
};

type Event = {
    id: string;
    visitor_id: string;
    hostname: string;
    name: string;
    properties: Record<string, any>;
    created_at: string;
};

type Activity = (Visit & { type: 'visit' }) | (Event & { type: 'event' });


type PageVisit = {
    pathname: string;
    visit_count: number;
    unique_visitors: number;
}

type PlanClick = {
    name: string;
    clicks: Event[];
};

type ChartDataPoint = {
    date: string;
    visits: number;
};

type FilterRange = 'today' | '7d' | '30d' | 'month' | 'custom';

const filterOptions: { label: string; value: Exclude<FilterRange, 'custom'> }[] = [
    { label: 'Hoje', value: 'today' },
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Este Mês', value: 'month' },
];

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [domains, setDomains] = useState<string[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>('all');
    
    // Stats
    const [allVisits, setAllVisits] = useState<Visit[]>([]);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [activityFeed, setActivityFeed] = useState<Activity[]>([]);

    const [totalVisits, setTotalVisits] = useState(0);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [clickEvents, setClickEvents] = useState(0);
    const [bounceRate, setBounceRate] = useState(0);
    const [topPages, setTopPages] = useState<PageVisit[]>([]);
    const [topPlans, setTopPlans] = useState<PlanClick[]>([]);
    const [dailyVisits, setDailyVisits] = useState<ChartDataPoint[]>([]);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date()),
    });
    const [activeFilter, setActiveFilter] = useState<FilterRange>('30d');

     useEffect(() => {
        const fetchDomains = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('domains').select('hostname');
            if (error) console.error("Error fetching domains:", error);
            else setDomains(data.map(d => d.hostname));
        };
        fetchDomains();
    }, []);

    const fetchData = useCallback(async (startDate: Date, endDate: Date, domain: string) => {
        setLoading(true);
        const supabase = createClient();
        
        const queryEndDate = startOfDay(addDays(endDate, 1));
        
        let visitsQuery = supabase
            .from('visits')
            .select('id, visitor_id, hostname, pathname, is_new_visitor, created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', queryEndDate.toISOString());
            
        let eventsQuery = supabase
            .from('events')
            .select('id, visitor_id, hostname, name, properties, created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', queryEndDate.toISOString());

        if (domain !== 'all') {
            visitsQuery = visitsQuery.eq('hostname', domain);
            eventsQuery = eventsQuery.eq('hostname', domain);
        }

        const [{ data: visitsData, error: visitsError }, { data: eventsData, error: eventsError }] = await Promise.all([
            visitsQuery,
            eventsQuery
        ]);
        
        if (visitsError || eventsError) {
            console.error("Error fetching data:", visitsError || eventsError);
            setLoading(false);
            return;
        }

        setAllVisits(visitsData);
        setAllEvents(eventsData);

        // --- Process Data ---
        setTotalVisits(visitsData.length);
        const uniqueVisitorIds = new Set(visitsData.map(v => v.visitor_id));
        setUniqueVisitors(uniqueVisitorIds.size);
        setClickEvents(eventsData.length);
        
        const visitorActions: Record<string, {visits: number, events: number}> = {};
        visitsData.forEach(v => {
            if (!visitorActions[v.visitor_id]) visitorActions[v.visitor_id] = { visits: 0, events: 0 };
            visitorActions[v.visitor_id].visits++;
        });
        eventsData.forEach(e => {
            if (visitorActions[e.visitor_id]) visitorActions[e.visitor_id].events++;
        });
        const bouncedVisitors = Object.values(visitorActions).filter(v => v.events === 0).length;
        setBounceRate(uniqueVisitorIds.size > 0 ? (bouncedVisitors / uniqueVisitorIds.size) * 100 : 0);

        const pageCounts = visitsData.reduce((acc, visit) => {
            if (!acc[visit.pathname]) {
                 acc[visit.pathname] = { visit_count: 0, visitors: new Set() };
            }
            acc[visit.pathname].visit_count++;
            acc[visit.pathname].visitors.add(visit.visitor_id);
            return acc;
        }, {} as Record<string, { visit_count: number; visitors: Set<string> }>);
        const sortedPages = Object.entries(pageCounts).map(([pathname, data]) => ({ pathname, visit_count: data.visit_count, unique_visitors: data.visitors.size })).sort((a, b) => b.visit_count - a.visit_count).slice(0, 5);
        setTopPages(sortedPages);
        
        if (activeFilter === 'today') {
            const hourlyCounts: Record<string, number> = {};
            const intervalHours = eachHourOfInterval({ start: startOfDay(startDate), end: endOfDay(endDate) });
            intervalHours.forEach(hour => hourlyCounts[format(hour, 'yyyy-MM-dd HH:00')] = 0);
            visitsData.forEach(visit => {
                const hourStr = format(new Date(visit.created_at), 'yyyy-MM-dd HH:00');
                if (hourlyCounts[hourStr] !== undefined) hourlyCounts[hourStr]++;
            });
            setDailyVisits(Object.entries(hourlyCounts).map(([date, visits]) => ({ date, visits })));
        } else {
            const dailyCounts: Record<string, number> = {};
            const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
            intervalDays.forEach(day => dailyCounts[format(day, 'yyyy-MM-dd')] = 0);

            visitsData.forEach(visit => {
                const date = format(new Date(visit.created_at), 'yyyy-MM-dd');
                if (dailyCounts[date] !== undefined) dailyCounts[date]++;
            });
            setDailyVisits(Object.entries(dailyCounts).map(([date, visits]) => ({ date, visits })));
        }

        const planClickGroups = eventsData
            .filter(e => e.name === 'cta_click' && e.properties.plan_name)
            .reduce((acc, e) => {
                const planName = e.properties.plan_name;
                if (!acc[planName]) {
                    acc[planName] = [];
                }
                acc[planName].push(e);
                return acc;
            }, {} as Record<string, Event[]>);
        
        setTopPlans(Object.entries(planClickGroups).map(([name, clicks]) => ({ name, clicks })).sort((a, b) => b.clicks.length - a.clicks.length));


        const combinedFeed: Activity[] = [
            ...(visitsData.map(v => ({ ...v, type: 'visit' as const }))),
            ...(eventsData.map(e => ({ ...e, type: 'event' as const })))
        ];
        combinedFeed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivityFeed(combinedFeed.slice(0, 15));


        setLoading(false);
    }, [activeFilter]);
    
    useEffect(() => {
        if (activeFilter === 'custom') return;
        const now = new Date();
        let fromDate;
        switch (activeFilter) {
            case 'today': fromDate = startOfDay(now); break;
            case '7d': fromDate = startOfDay(subDays(now, 6)); break;
            case 'month': fromDate = startOfMonth(now); break;
            case '30d': default: fromDate = startOfDay(subDays(now, 29)); break;
        }
        setDateRange({ from: fromDate, to: endOfDay(now) });
    }, [activeFilter]);
    
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchData(dateRange.from, dateRange.to, selectedDomain);
        }
    }, [dateRange, selectedDomain, fetchData]);
    
    const handleDateRangeSelect = (range: DateRange | undefined) => {
        if (range?.from) {
             setDateRange({ from: range.from, to: range.to || range.from });
             setActiveFilter('custom');
        }
    }

    const newVisitorsPercentage = useMemo(() => {
        if (uniqueVisitors === 0) return 0;
        const newVisitorIds = new Set(allVisits.filter(v => v.is_new_visitor).map(v => v.visitor_id));
        return (newVisitorIds.size / uniqueVisitors) * 100;
    }, [allVisits, uniqueVisitors]);

    const chartConfig = {
        visits: { label: "Visitas", color: "hsl(var(--primary))" },
    };

    const tickFormatter = (value: string) => {
        if (activeFilter === 'today') {
            return format(new Date(value), "HH:00");
        }
        return format(new Date(value), "d MMM", { locale: ptBR });
    };
    
    const ClicksModalContent = ({ clicks }: { clicks: Event[] }) => {
        const clicksByVisitor = useMemo(() => {
            return clicks.reduce((acc, click) => {
                if (!acc[click.visitor_id]) {
                    acc[click.visitor_id] = [];
                }
                acc[click.visitor_id].push(click);
                return acc;
            }, {} as Record<string, Event[]>);
        }, [clicks]);

        return (
            <ScrollArea className="h-72">
                <div className="space-y-4 pr-4">
                    {Object.entries(clicksByVisitor).map(([visitorId, visitorClicks]) => (
                        <Collapsible key={visitorId}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary p-2 text-left text-sm group">
                                <div className="font-mono text-xs text-muted-foreground truncate">
                                    <span className="font-semibold text-foreground">Visitante:</span> {visitorId.substring(0, 8)}...
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="rounded-md bg-background px-2 py-0.5 text-xs font-semibold">{visitorClicks.length} clique{visitorClicks.length > 1 && 's'}</span>
                                     <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="space-y-1 py-2 pl-4 border-l ml-2">
                                {visitorClicks.map(click => (
                                    <div key={click.id} className="text-xs text-muted-foreground">
                                        {format(new Date(click.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                                    </div>
                                ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </ScrollArea>
        );
    };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><BarChart className="text-primary"/> Estatísticas do Site</h1>
                    <p className="text-gray-500">Análise de tráfego e comportamento dos visitantes.</p>
                </div>
                 <div className="flex items-center gap-2 flex-wrap mt-4 sm:mt-0">
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="w-full sm:w-48" id="domain-filter">
                            <SelectValue placeholder="Todos os domínios"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all"><Globe className="w-4 h-4 mr-2 inline-block"/> Todos os domínios</SelectItem>
                            {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="flex shrink-0 rounded-xl bg-card border p-1 text-sm">
                        {filterOptions.map((opt) => (
                        <button key={opt.value} onClick={() => setActiveFilter(opt.value)}
                            className={cn(`rounded-lg px-3 py-1.5 transition-colors text-sm`, activeFilter === opt.value ? "bg-primary text-primary-foreground" : "text-card-foreground hover:bg-black/5")}>
                            {opt.label}
                        </button>
                        ))}
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal sm:w-[260px]", !dateRange && "text-muted-foreground", activeFilter === 'custom' && "border-primary ring-1 ring-primary")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Selecione um período</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={handleDateRangeSelect} numberOfMonths={2} locale={ptBR}/>
                        </PopoverContent>
                    </Popover>
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
                        <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{uniqueVisitors}</div>
                         <p className="text-xs text-gray-500">Total de {totalVisits} page views.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(totalVisits > 0 ? (allEvents.length / totalVisits) * 100 : 0).toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">{allEvents.length} cliques totais.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{bounceRate.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">Visitas sem interação.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Visitantes</CardTitle>
                        <UserPlus className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{newVisitorsPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">Percentual de primeiras visitas.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Visão Geral das Visitas</CardTitle>
                        <CardDescription>Um panorama do tráfego recebido no período selecionado.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ChartContainer config={chartConfig} className="w-full h-full">
                            <RechartsBarChart data={dailyVisits} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={tickFormatter}/>
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} domain={['auto', 'dataMax + 10']} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mt-8">
                 <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="text-primary"/> Atividade Recente</CardTitle>
                        <CardDescription>O que seus visitantes estão fazendo agora.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activityFeed.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className="grid place-items-center bg-secondary rounded-full w-8 h-8 flex-shrink-0">
                                    {activity.type === 'visit' ? <Eye className="w-4 h-4 text-muted-foreground" /> : <MousePointerClick className="w-4 h-4 text-muted-foreground"/>}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {activity.type === 'visit' ? `Visita em ${activity.pathname}` : `Clique em "${activity.properties.buttonId || 'Elemento'}"`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                        ))}
                         {activityFeed.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Nenhuma atividade registrada no período.</p>}
                    </CardContent>
                </Card>
                <div className="md:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MousePointerClick className="text-primary"/>Planos Mais Clicados</CardTitle>
                             <CardDescription>Visão geral do interesse dos visitantes nos planos oferecidos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topPlans.length === 0 ? (
                                <p className="h-24 text-center text-muted-foreground flex items-center justify-center">Nenhum clique em planos no período.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topPlans.map(plan => (
                                    <Dialog key={plan.name}>
                                        <DialogTrigger asChild>
                                            <div className="group cursor-pointer rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1">
                                                <div className="flex items-start justify-between">
                                                    <p className="font-semibold text-card-foreground">{plan.name}</p>
                                                    <Gauge className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-3xl font-bold text-foreground mt-2">{plan.clicks.length}</p>
                                                <p className="text-xs text-muted-foreground">cliques</p>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>Histórico de Cliques: {plan.name}</DialogTitle>
                                                <DialogDescription>
                                                    Lista de visitantes que clicaram neste plano e a quantidade de cliques.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ClicksModalContent clicks={plan.clicks} />
                                        </DialogContent>
                                    </Dialog>
                                ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                                        <TableHead className="text-right">Visitantes Únicos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topPages.map(page => (
                                        <TableRow key={page.pathname}>
                                            <TableCell className="font-mono text-sm">{page.pathname}</TableCell>
                                            <TableCell className="text-right font-medium">{page.visit_count}</TableCell>
                                            <TableCell className="text-right font-medium">{page.unique_visitors}</TableCell>
                                        </TableRow>
                                    ))}
                                    {topPages.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nenhuma visita registrada no período.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                   
                </div>
            </div>
            </>
            )}
        </>
    );
}


