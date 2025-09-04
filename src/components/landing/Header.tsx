"use client";

import { useState } from "react";
import { Wifi, ChevronRight, Menu, User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#planos", label: "Planos" },
    { href: "#cobertura", label: "Cobertura" },
    { href: "#vantagens", label: "Vantagens" },
    { href: "#ceo", label: "CEO" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="group flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-neutral-950 shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Velpro Telecom</p>
            <p className="text-xs text-white/60 transition-colors group-hover:text-white/80">
              Fibra 100% + Wi‑Fi 6
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-white/80 transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/cliente"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/5"
          >
            <User className="h-4 w-4" /> Área do Cliente
          </Link>
          <a
            href="#planos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Assine já <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <button
          aria-label="Abrir menu"
          className="rounded-xl border border-white/10 p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
             <Link
              href="/cliente"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <User className="h-4 w-4" /> Área do Cliente
            </Link>
            <a
              href="#planos"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground"
            >
              Assine já <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
