
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  FileText,
  User,
  Shield,
  Zap,
  Ban,
  Scale,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  const termsSections = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "1. Aceitação dos Termos",
      content:
        "Ao contratar ou utilizar os serviços da Velpro Telecom, você concorda em cumprir estes Termos de Uso. Este documento constitui um acordo legal entre você (o 'Usuário') e a Velpro. Se você não concordar com qualquer parte dos termos, não deverá utilizar nossos serviços.",
    },
    {
      icon: <User className="h-6 w-6 text-primary" />,
      title: "2. Uso dos Serviços",
      content:
        "Nossos serviços de internet são destinados para uso residencial ou comercial, conforme o plano contratado. Você concorda em não utilizar os serviços para fins ilegais, como violação de direitos autorais, envio de spam, ou qualquer atividade que possa prejudicar a rede ou outros usuários.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "3. Velocidade e Disponibilidade",
      content:
        "A Velpro se compromete a entregar a velocidade de conexão contratada, mas adverte que fatores externos, como a qualidade do equipamento do usuário ou congestionamento em sites de terceiros, podem afectar a performance. A disponibilidade do serviço é garantida em 99.8%, salvo manutenções programadas ou eventos de força maior.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "4. Equipamentos",
      content:
        "Os equipamentos fornecidos pela Velpro (como roteadores ou modems) são em regime de comodato. O usuário é responsável por zelar pelos equipamentos e deverá devolvê-los em bom estado ao final do contrato. Danos por mau uso podem ser cobrados.",
    },
    {
      icon: <Ban className="h-6 w-6 text-primary" />,
      title: "5. Cancelamento e Suspensão",
      content:
        "O serviço pode ser cancelado a qualquer momento. Em caso de cancelamento dentro do período de fidelidade (12 meses), será cobrada multa proporcional referente aos custos da instalação. A Velpro se reserva o direito de suspender o serviço por violação destes termos ou por falta de pagamento.",
    },
    {
      icon: <Scale className="h-6 w-6 text-primary" />,
      title: "6. Limitação de Responsabilidade",
      content:
        "A Velpro não se responsabiliza por quaisquer perdas ou danos indiretos sofridos pelo usuário em decorrência do uso ou da incapacidade de usar o serviço. Nossa responsabilidade total está limitada ao valor mensal do plano contratado.",
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "7. Alterações nos Termos",
      content:
        "Podemos atualizar estes Termos de Uso periodicamente. Notificaremos os usuários sobre mudanças significativas através de nossos canais oficiais. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-secondary border-b border-border py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                 <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Termos de Uso</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Última atualização: 08 de Setembro de 2025.
                </p>
                 <p className="mt-2 text-sm text-muted-foreground/80">Entenda as regras e condições para usar nossos serviços.</p>
            </div>
        </div>

        <div className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
                {termsSections.map((section) => (
                    <div key={section.title} className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                            {section.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                        </div>
                    </div>
                ))}

                 <div className="text-center pt-8 border-t border-border">
                    <p className="text-muted-foreground">Para voltar à página inicial, clique abaixo.</p>
                    <Link href="/" className="mt-4 inline-block text-primary hover:text-primary/80 transition-colors">
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
