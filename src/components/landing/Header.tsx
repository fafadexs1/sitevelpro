"use client";

import { useState } from "react";
import { Wifi, ChevronRight, Menu } from "lucide-react";

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
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-neutral-950 shadow-lg shadow-emerald-400/20">
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

        <div className="hidden md:block">
          <a
            href="#planos"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-medium text-neutral-950 shadow-lg shadow-emerald-400/20 transition-colors hover:bg-emerald-400"
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
            <a
              href="#planos"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 font-medium text-neutral-950"
            >
              Assine já <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
