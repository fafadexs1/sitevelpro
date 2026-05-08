import { Building2, Gamepad2, Home, MapPin, Router, Video } from "lucide-react";
import Link from "next/link";

import type { LocalSeoContent } from "@/lib/local-seo";

const useCaseIcons = [Gamepad2, Home, Video, Building2];

export function LocalSeoSection({ content }: { content: LocalSeoContent }) {
  const whatsappText = encodeURIComponent(
    `Olá, quero consultar internet fibra da Velpro em ${content.city}.`
  );

  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" />
            {content.city} - {content.state}
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {content.headline}
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.intro}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.reasons.map((reason) => (
              <div key={reason.title} className="rounded-lg border border-border bg-card p-5">
                <Router className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-card-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary p-6">
            <h3 className="text-xl font-semibold text-foreground">
              Consulte cobertura em {content.city}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Envie seu CEP, rua, número e bairro para confirmar a disponibilidade no seu endereço.
            </p>
            <Link
              href={`https://wa.me/556108003810404?text=${whatsappText}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Consultar pelo WhatsApp
            </Link>
          </div>

          {content.neighborhoods.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground">
                Bairros e regiões de interesse
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {content.neighborhoods.map((neighborhood) => (
                  <span
                    key={neighborhood}
                    className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-card-foreground">Cidades próximas</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A Velpro também trabalha para atender moradores e empresas no Entorno.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {content.nearbyCities.map((city) => (
                <span
                  key={city}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {content.useCases.map((item, index) => {
            const Icon = useCaseIcons[index] ?? Router;
            return (
              <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Perguntas frequentes sobre internet em {content.city}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Respostas diretas para quem está comparando provedores de internet fibra na região.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.faqs.map((item) => (
            <details key={item.question} className="group rounded-lg border border-border bg-card p-5">
              <summary className="cursor-pointer list-none font-semibold text-card-foreground">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
