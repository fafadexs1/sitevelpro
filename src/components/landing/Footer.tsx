"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border/40 bg-background/40 backdrop-blur-md py-10 text-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>© {year || new Date().getFullYear()} Velpro Telecom — Todos os direitos reservados.</p>
        <div className="flex items-center gap-5">
          <Link href="/politica-de-privacidade" className="transition-colors hover:text-foreground">Privacidade</Link>
          <Link href="/termos-de-uso" className="transition-colors hover:text-foreground">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
