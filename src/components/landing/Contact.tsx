
import { Phone, MessageCircle, MapPin } from "lucide-react";

export function Contact() {
  const contactOptions = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "Telefone",
      desc: "0800 381 0404",
      href: "tel:+5508003810404",
      id: "contact-link-telefone",
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
      title: "WhatsApp",
      desc: "Assine ou tire dúvidas pelo WhatsApp",
      href: "https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos.",
      id: "contact-link-whatsapp",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Endereço",
      desc: "SQ 13 QUADRA 01 LOTE 11 SALA 101 CENTRO, Cidade Ocidental - GO",
      href: "https://www.google.com/maps/search/?api=1&query=SQ+13+QUADRA+01+LOTE+11+SALA+101+CENTRO,+Cidade+Ocidental+-+GO",
      id: "contact-link-endereco",
    },
  ];

  return (
    <section id="contato" className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Fale com a gente</h2>
          <p className="mt-2 text-muted-foreground">Tire dúvidas, consulte planos e agende a instalação.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {contactOptions.map((item) => (
            <a
              key={item.title}
              id={item.id}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/15">{item.icon}</div>
              <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
              <p className="mt-1 text-muted-foreground">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
