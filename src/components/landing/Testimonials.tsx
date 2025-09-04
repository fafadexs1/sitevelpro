import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    { name: "Ana • Criadora", text: "Upload rápido e live sem travar. Suporte me atendeu em minutos!", stars: 5 },
    { name: "Marcos • Gamer", text: "Ping baixíssimo nos servers. Mudou meu competitivo.", stars: 5 },
    { name: "Luciana • Home Office", text: "Chamadas perfeitas e redundância bem configurada.", stars: 5 },
  ];

  return (
    <section className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Clientes que sentem a diferença</h2>
          <p className="mt-2 text-white/70">Histórias reais de quem depende da internet todos os dias.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6">
              <div className="mb-3 flex items-center gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                ))}
              </div>
              <p className="text-white/80">{t.text}</p>
              <p className="mt-4 text-sm text-white/60">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
