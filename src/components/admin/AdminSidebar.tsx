"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    Map,
    Megaphone,
    BarChart2,
    MessageSquare,
    Users,
    Database,
    Settings,
    Network,
    BookOpen,
    Play,
    Newspaper,
    Globe,
    Brush,
    Clapperboard,
    Tv,
    LogOut,
    ChevronDown,
    Wifi,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { createClient, type AuthUser } from "@/utils/supabase/client";
import Image from "next/image";

function DynamicLogo() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'company_logo_url')
                .single();

            if (data?.value) {
                setLogoUrl(data.value);
            }
        };
        fetchLogo();
    }, []);

    return (
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={40} height={40} className="object-contain" />
            ) : (
                <Wifi className="h-5 w-5" />
            )}
        </div>
    );
}

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className="w-full">
            <div
                className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
            >
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{label}</span>
                {isActive && <motion.div layoutId="active-nav" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
        </Link>
    )
}

const NavGroup = ({ title, icon: Icon, children, startOpen = false }: { title: string; icon: React.ElementType, children: React.ReactNode, startOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50 group">
                    <span className="flex items-center gap-3 text-sm font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        {title}
                    </span>
                    <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-90")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pl-9 pr-2 space-y-1 py-1">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export function AdminSidebar({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    const isGroupActive = (paths: string[]) => paths.some(path => pathname.startsWith(path));

    return (
        <aside className="hidden h-screen w-72 flex-col border-r border-border bg-card/50 backdrop-blur-xl md:flex sticky top-0">
            <div className="p-6">
                <Link href="/" className="group flex items-center gap-3 mb-8">
                    <DynamicLogo />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Velpro</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin Panel</span>
                    </div>
                </Link>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Gerenciamento</p>
                        <NavGroup title="Conteúdo" icon={BookOpen} startOpen={isGroupActive(['/admin/hero-slides', '/admin/posts', '/admin/seo', '/admin/themes'])}>
                            <NavLink href="/admin/hero-slides" label="Slides do Herói" icon={Play} />
                            <NavLink href="/admin/posts" label="Artigos do Blog" icon={Newspaper} />
                            <NavLink href="/admin/seo" label="SEO & Metadados" icon={Globe} />
                            <NavLink href="/admin/themes" label="Aparência" icon={Brush} />
                        </NavGroup>
                        <NavGroup title="Planos e TV" icon={Package} startOpen={isGroupActive(['/admin/plans', '/admin/tv-channels', '/admin/tv-packages'])}>
                            <NavLink href="/admin" label="Planos de Internet" icon={LayoutDashboard} />
                            <NavLink href="/admin/tv-channels" label="Canais de TV" icon={Clapperboard} />
                            <NavLink href="/admin/tv-packages" label="Pacotes de TV" icon={Tv} />
                        </NavGroup>
                        <NavLink href="/admin/cities" label="Cidades de Cobertura" icon={Map} />
                    </div>

                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Marketing & Vendas</p>
                        <NavGroup title="Marketing" icon={Megaphone} startOpen={isGroupActive(['/admin/google-ads', '/admin/statistics', '/admin/popups', '/admin/crm'])}>
                            <NavLink href="/admin/google-ads" label="Google Ads" icon={Megaphone} />
                            <NavLink href="/admin/statistics" label="Estatísticas" icon={BarChart2} />
                            <NavLink href="/admin/popups" label="Pop-ups" icon={MessageSquare} />
                            <NavLink href="/admin/crm" label="Leads & CRM" icon={Users} />
                        </NavGroup>
                    </div>

                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Configurações</p>
                        <NavGroup title="Sistema" icon={Settings} startOpen={isGroupActive(['/admin/database', '/admin/settings', '/admin/domains'])}>
                            <NavLink href="/admin/database" label="Banco de Dados" icon={Database} />
                            <NavLink href="/admin/settings" label="Configurações Gerais" icon={Settings} />
                            <NavLink href="/admin/domains" label="Domínios" icon={Network} />
                        </NavGroup>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-border p-4 bg-card/30">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground">Administrador</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                >
                    <LogOut className="h-4 w-4" /> Sair do Sistema
                </Button>
            </div>
        </aside>
    );
}
