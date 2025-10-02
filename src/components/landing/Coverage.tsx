
"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import Link from "next/link";

interface City {
    name: string;
    slug: string;
}

interface CoverageProps {
    city?: string | null;
    cities: City[];
}

function CityLinks({ cities }: { cities: City[] }) {
    if (!cities || cities.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h3 className="text-center font-medium text-muted-foreground">Ou navegue por nossas áreas de cobertura:</h3>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                {cities.map(city => {
                    const href = `/internet-em-${city.slug}`;
                    return (
                        <Link key={city.slug} href={href} className="text-foreground hover:text-primary transition-colors">
                            {city.name}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export function Coverage({ city, cities }: CoverageProps) {
  const [cep, setCep] = useState("");
  const [coverage, setCoverage] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleCoverageCheck(e: React.FormEvent) {
    e.preventDefault();
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setCoverage({ ok: false, msg: "Digite um CEP válido (8 dígitos)." });
      return;
    }
    // Demo logic: pseudo-random availability by last digit
    const last = Number(clean[clean.length - 1]);
    const ok = last % 2 === 0;
    setCoverage({
      ok,
      msg: ok
        ? `Cobertura disponível para este CEP${city ? ` em ${city}`: ''}! Podemos instalar em até 48h.`
        : `Ainda não atendemos esse CEP${city ? ` em ${city}`: ''}. Deixe seu contato.`
    });
  }

  return (
    <section id="cobertura" className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl text-center mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Consulte sua cobertura{city ? ` em ${city}` : ''}</h2>
          <p className="mt-2 text-muted-foreground">Informe seu CEP e verifique se já atendemos sua região.</p>
        </div>
        <form onSubmit={handleCoverageCheck} className="grid max-w-xl gap-3 sm:flex sm:items-center mx-auto">
          <label htmlFor="cep" className="sr-only">CEP</label>
          <input
            id="cep-input"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite seu CEP"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary sm:max-w-xs"
          />
          <button
            id="coverage-check-button"
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Verificar <MapPin className="h-4 w-4" />
          </button>
        </form>
        {coverage && (
          <div
            className={`mt-4 max-w-xl rounded-xl border px-4 py-3 text-center mx-auto ${
              coverage.ok
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-yellow-400/40 bg-yellow-400/10 text-yellow-500"
            }`}
          >
            {coverage.msg}
          </div>
        )}
        
        <CityLinks cities={cities} />

      </div>
    </section>
  );
}
