import { Check, Star, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function Ceo() {
  const achievements = [
    "15+ anos construindo redes de alta disponibilidade",
    "Times de NOC e suporte com SLA agressivo",
    "Transparência, dados e melhoria contínua",
  ];

  return (
    <section id="ceo" className="border-t border-white/5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="mb-6 text-sm text-emerald-300">Nossa liderança</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Um CEO visionário, obcecado por experiência do cliente
          </h2>
          <p className="mt-4 text-white/70">
            Liderança focada em qualidade, inovação contínua e atendimento de
            alto nível. Sob essa visão, a Velpro mantém índices de satisfação
            excepcionais e uma cultura de melhoria constante.
          </p>
          <ul className="mt-6 space-y-3 text-white/80">
            {achievements.map((li) => (
              <li key={li} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> {li}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-neutral-900/60 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 p-[3px]">
              <Image
                src="https://picsum.photos/200/200"
                width={112}
                height={112}
                alt="Foto do CEO da Velpro"
                data-ai-hint="ceo portrait"
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <p className="text-lg font-semibold">CEO da Velpro</p>
            <p className="mt-1 text-white/70">
              “Excelência é detalhe repetido. A gente mede, melhora e entrega.”
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-emerald-300" /> NPS 92
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> SLA 99,9%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
