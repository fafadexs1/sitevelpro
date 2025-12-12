
"use client";

import { useState, useEffect } from "react";
import { Wifi, ChevronRight, Menu, User, X, FileText, ArrowRight, Smartphone, Download, Gauge, MonitorSmartphone, CircleDollarSign, MessageCircle, Phone, ChevronDown, Tv, Package, Shield, Building, Info, LifeBuoy, GanttChartSquare, Sparkle, MapPin, Newspaper, HelpCircle, BookHeart } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./TopBar";

type DomainType = 'main_site' | 'sales_page';

const NavMenu = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="group text-sm text-muted-foreground transition-colors hover:text-foreground">
        <Icon className="mr-2 h-4 w-4" />
        {title}
        <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-60" align="start">
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

const NavMenuItem = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon: React.ElementType }) => (
  <DropdownMenuItem asChild className="cursor-pointer">
    <Link href={href} className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{children}</span>
    </Link>
  </DropdownMenuItem>
);

function DynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };
    fetchLogo();
  }, []);

  if (loading) {
    return <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary" />;
  }

  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20 overflow-hidden">
      {logoUrl ? (
        <Image src={logoUrl} alt="Logo da Empresa" width={36} height={36} className="object-contain" />
      ) : (
        <Wifi className="h-5 w-5" />
      )}
    </div>
  );
}


export function Header() {
  const [showAfterHoursDialog, setShowAfterHoursDialog] = useState(false);
  const [domainType, setDomainType] = useState<DomainType>('sales_page');

  useEffect(() => {
    const getDomainType = async () => {
      const hostname = window.location.hostname;
      const supabase = createClient();
      const { data } = await supabase
        .from('domains')
        .select('type')
        .eq('hostname', hostname)
        .single();

      if (data) {
        setDomainType(data.type as DomainType);
      }
    };
    getDomainType();
  }, []);

  const handleCallClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Horário de funcionamento: 08:05 até 17:59
    const isOutOfHours = currentHour < 8 || (currentHour === 8 && currentMinute < 5) || currentHour >= 18;

    if (isOutOfHours) {
      e.preventDefault();
      setShowAfterHoursDialog(true);
    }
    // Se estiver no horário, o comportamento padrão do link (href="tel:...") prosseguirá.
  };

  const MainCtaButton = () => {
    const isMainSite = domainType === 'main_site';
    const href = isMainSite ? 'https://velpro.net.br/app/app.html' : 'tel:08003810404';
    const label = isMainSite ? 'Área do Cliente' : 'Ligue Agora';
    const Icon = isMainSite ? User : Phone;

    return (
      <a
        id="header-cta-ligue"
        href={href}
        onClick={!isMainSite ? handleCallClick : undefined}
        data-track-event="cta_click"
        data-track-prop-button-id="main-cta-header"
        className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        <Icon className="h-4 w-4" /> {label}
      </a>
    );
  };

  const MobileMainCtaButton = () => {
    const isMainSite = domainType === 'main_site';
    const href = isMainSite ? 'https://velpro.net.br/app/app.html' : 'tel:08003810404';
    const label = isMainSite ? 'Área do Cliente' : 'Ligar agora';
    const Icon = isMainSite ? User : Phone;
    const [showText, setShowText] = useState(true);

    useEffect(() => {
      if (isMainSite) {
        const timer = setTimeout(() => {
          setShowText(false);
        }, 2500); // Mostra o texto por 2.5 segundos
        return () => clearTimeout(timer);
      }
    }, [isMainSite]);

    return (
      <a
        id="mobile-cta-ligue"
        href={href}
        data-track-event="cta_click"
        data-track-prop-button-id="main-cta-header-mobile"
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl border border-input bg-background text-sm font-medium text-foreground transition-all duration-300 hover:bg-accent overflow-hidden",
          isMainSite ? (showText ? "w-36 h-10 px-3" : "w-10 h-10") : "w-10 h-10"
        )}
        aria-label={label}
      >
        <AnimatePresence>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {isMainSite && (
              <motion.span
                initial={{ opacity: 1, width: 'auto' }}
                animate={{ opacity: showText ? 1 : 0, width: showText ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="whitespace-nowrap"
              >
                Área do Cliente
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>
      </a>
    )
  }

  const mobileNavLinks = [
    { href: "#planos", icon: Package, text: "Planos e Serviços" },
    { href: "#vantagens", icon: Sparkle, text: "Vantagens" },
    { href: "/tv", icon: Tv, text: "Pacotes de TV" },
    { href: "/blog", icon: Newspaper, text: "Blog" },
    { href: "#faq", icon: HelpCircle, text: "Dúvidas Frequentes" },
    { href: "#contato", icon: MessageCircle, text: "Fale Conosco" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-col border-b border-border/40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TopBar />
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a id="nav-logo" href="/" className="group flex items-center gap-3">
            <DynamicLogo />
            <div>
              <p className="text-lg font-semibold leading-none text-foreground">Velpro Telecom</p>
              <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/80">
                Fibra 100% + Wi‑Fi 6
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <NavMenu title="Planos e Serviços" icon={Package}>
              <NavMenuItem href="#planos" icon={Package}>Planos de Internet</NavMenuItem>
              <NavMenuItem href="/tv" icon={Tv}>Pacotes de TV</NavMenuItem>
              <NavMenuItem href="#vantagens" icon={Sparkle}>Vantagens</NavMenuItem>
              <NavMenuItem href="#cobertura" icon={MapPin}>Consultar Cobertura</NavMenuItem>
            </NavMenu>
            <NavMenu title="Empresa" icon={Building}>
              <NavMenuItem href="/historia" icon={BookHeart}>Nossa História</NavMenuItem>
              <NavMenuItem href="/politica-de-privacidade" icon={Shield}>Política de Privacidade</NavMenuItem>
              <NavMenuItem href="/termos-de-uso" icon={FileText}>Termos de Uso</NavMenuItem>
            </NavMenu>
            <NavMenu title="Ajuda" icon={LifeBuoy}>
              <NavMenuItem href="/blog" icon={Newspaper}>Artigos</NavMenuItem>
              <NavMenuItem href="#faq" icon={Info}>Perguntas Frequentes</NavMenuItem>
              <NavMenuItem href="#contato" icon={MessageCircle}>Fale Conosco</NavMenuItem>
            </NavMenu>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <MainCtaButton />
            <a
              id="header-cta-assine"
              href="/assinar"
              data-track-event="cta_click"
              data-track-prop-button-id="assine-ja-header"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:-translate-y-0.5"
            >
              Assinar Agora <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <MobileMainCtaButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" id="mobile-menu-toggle" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm bg-card p-0 flex flex-col">
                <SheetHeader className="p-4 border-b border-border text-left">
                  <SheetTitle className="flex items-center gap-2 font-semibold text-card-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    2ª via da conta
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-6 overflow-y-auto">
                  <div className="relative">
                    <Input placeholder="CPF ou CNPJ" className="pr-12 h-12 text-base" />
                    <Button size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-full">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><MonitorSmartphone className="h-4 w-4" />Precisou? Use o app da Velpro</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 bg-background hover:bg-accent cursor-pointer">
                        <Download className="h-6 w-6 text-primary" />
                        <span className="text-sm text-center">Faça download</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 bg-background hover:bg-accent cursor-pointer">
                        <Gauge className="h-6 w-6 text-primary" />
                        <span className="text-sm text-center">Mais Velocidade</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Wifi className="h-4 w-4" />Resolva rápido</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 bg-background hover:bg-accent cursor-pointer">
                        <User className="h-6 w-6 text-primary" />
                        <span className="text-sm text-center">Desbloquear serviço</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 bg-background hover:bg-accent cursor-pointer">
                        <CircleDollarSign className="h-6 w-6 text-primary" />
                        <span className="text-sm text-center">Negociar dívidas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-grow border-t border-border"></div>
                    <span>NAVEGUE</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <nav className="grid grid-cols-2 gap-3">
                    {mobileNavLinks.map(link => (
                      <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 bg-background hover:bg-accent cursor-pointer text-center">
                        <link.icon className="h-6 w-6 text-primary" />
                        <span className="text-sm">{link.text}</span>
                      </Link>
                    ))}
                  </nav>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-grow border-t border-border"></div>
                    <span>OU</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <div className="space-y-3">
                    <a href="https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos." target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent p-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
                      <MessageCircle className="h-5 w-5" /> CONVERSAR NO WHATSAPP
                    </a>
                    <a href="tel:+5508003810404" onClick={(e: any) => handleCallClick(e)} className="w-full inline-flex items-center justify-center gap-2 p-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      <Phone className="h-4 w-4" /> Ligar para 0800 381 0404
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AlertDialog open={showAfterHoursDialog} onOpenChange={setShowAfterHoursDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Horário de Atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Nosso setor comercial funciona das 08:05 às 18:00. Mas não se preocupe, você ainda pode contratar nossos serviços!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline">Fechar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos." target="_blank" rel="noopener noreferrer">
                Continuar pelo WhatsApp
              </a>
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Link href="/assinar">
                Continuar pelo site
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
