
import { Check, Star, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function Ceo() {
  const achievements = [
    "15+ anos construindo redes de alta disponibilidade",
    "Times de NOC e suporte com SLA agressivo",
    "Transparência, dados e melhoria contínua",
  ];

  return (
    <section id="ceo" className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="mb-6 text-sm font-semibold text-primary">Nossa liderança</div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Um CEO visionário, obcecado por experiência do cliente
          </h2>
          <p className="mt-4 text-muted-foreground">
            Liderança focada em qualidade, inovação contínua e atendimento de
            alto nível. Sob essa visão, a Velpro mantém índices de satisfação
            excepcionais e uma cultura de melhoria constante.
          </p>
          <ul className="mt-6 space-y-3 text-foreground/80">
            {achievements.map((li) => (
              <li key={li} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {li}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-green-400 p-[3px]">
              <Image
                src="https://picsum.photos/200/200"
                width={112}
                height={112}
                alt="Foto do CEO da Velpro"
                data-ai-hint="ceo portrait"
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <p className="text-lg font-semibold text-card-foreground">CEO da Velpro</p>
            <p className="mt-1 text-muted-foreground">
              “Excelência é detalhe repetido. A gente mede, melhora e entrega.”
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-primary" /> NPS 92
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" /> SLA 99,9%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
