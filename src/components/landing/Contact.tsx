import { Phone, MessageCircle, MapPin } from "lucide-react";

export function Contact() {
  const contactOptions = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "Telefone",
      desc: "0800 000 000",
      href: "tel:+5508000000000",
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
      title: "WhatsApp",
      desc: "Assine ou tire dúvidas pelo WhatsApp",
      href: "https://wa.me/5500000000000",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Endereço",
      desc: "Av. da Fibra, 1000 — Centro • Sua Cidade",
      href: "#",
    },
  ];

  return (
    <section id="contato" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Fale com a gente</h2>
          <p className="mt-2 text-white/70">Tire dúvidas, consulte planos e agende a instalação.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {contactOptions.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              className="block rounded-2xl border border-white/10 bg-neutral-900/60 p-6 transition-colors hover:border-white/20"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/15">{item.icon}</div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-white/70">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
