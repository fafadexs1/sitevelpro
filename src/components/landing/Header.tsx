
"use client";

import { useState } from "react";
import { Wifi, ChevronRight, Menu, User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#planos", label: "Planos", id: "nav-planos" },
    { href: "#vantagens", label: "Vantagens", id: "nav-vantagens" },
    { href: "#tv", label: "TV", id: "nav-tv" },
    { href: "#ceo", label: "A Velpro", id: "nav-ceo" },
    { href: "#faq", label: "FAQ", id: "nav-faq" },
    { href: "#contato", label: "Contato", id: "nav-contato" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a id="nav-logo" href="#home" className="group flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none text-foreground">Velpro Telecom</p>
            <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/80">
              Fibra 100% + Wi‑Fi 6
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a key={item.href} id={item.id} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            id="header-cta-cliente"
            href="/cliente"
            data-track-event="cta_click"
            data-track-prop-button-id="area-cliente-header"
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <User className="h-4 w-4" /> Área do Cliente
          </Link>
          <a
            id="header-cta-assine"
            href="#planos"
            data-track-event="cta_click"
            data-track-prop-button-id="assine-ja-header"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Aproveitar oferta <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <button
          id="mobile-menu-toggle"
          aria-label="Abrir menu"
          className="rounded-xl border border-border p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                id={`mobile-${item.id}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </a>
            ))}
             <Link
              id="mobile-header-cta-cliente"
              href="/cliente"
              onClick={() => setMobileOpen(false)}
              data-track-event="cta_click"
              data-track-prop-button-id="area-cliente-mobile"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <User className="h-4 w-4" /> Área do Cliente
            </Link>
            <a
              id="mobile-header-cta-assine"
              href="#planos"
              onClick={() => setMobileOpen(false)}
              data-track-event="cta_click"
              data-track-prop-button-id="assine-ja-mobile"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground"
            >
              Aproveitar Oferta <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
