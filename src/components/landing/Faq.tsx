
import { ChevronRight } from "lucide-react";

export function Faq() {
  const faqs = [
    {
      q: "Tem fidelidade?",
      a: "Não exigimos fidelidade. Você fica porque quer — pela qualidade e atendimento.",
    },
    {
      q: "Qual roteador vem incluso?",
      a: "Fornecemos Wi‑Fi 6 com canais de 160 MHz e suporte a MU‑MIMO, ideal para muitas conexões simultâneas.",
    },
    {
      q: "Em quanto tempo é a instalação?",
      a: "Na maioria das regiões, em até 48h após a confirmação de cobertura.",
    },
    {
      q: "Oferecem IP fixo?",
      a: "Sim, como adicional para planos empresariais e sob solicitação em residenciais.",
    },
  ];

  return (
    <section id="faq" className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Perguntas frequentes</h2>
          <p className="mt-2 text-muted-foreground">Tudo que você precisa saber antes de assinar.</p>
        </div>
        <div className="grid max-w-4xl gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border bg-card p-5 transition-colors open:bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium text-card-foreground">
                {item.q}
                <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
