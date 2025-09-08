
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-white/5 py-10 text-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-white/60 sm:flex-row sm:px-6 lg:px-8">
        <p>© {year || new Date().getFullYear()} Velpro Telecom — Todos os direitos reservados.</p>
        <div className="flex items-center gap-5">
          <Link href="/politica-de-privacidade" className="transition-colors hover:text-white">Privacidade</Link>
          <a href="#" className="transition-colors hover:text-white">Termos</a>
          <a href="#" className="transition-colors hover:text-white">Status da rede</a>
        </div>
      </div>
    </footer>
  );
}
