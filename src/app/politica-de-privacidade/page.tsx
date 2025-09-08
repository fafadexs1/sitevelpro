import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Shield,
  Cookie,
  Users,
  Mail,
  Database,
  Server,
  Gavel,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const policySections = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Nosso Compromisso com a Privacidade",
      content:
        "A sua privacidade é uma prioridade para a Velpro Telecom. Esta política de privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site e utiliza nossos serviços. Nosso objetivo é ser transparente e proteger seus dados com o máximo rigor.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Coleta de Informações Pessoais",
      content:
        "Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e endereço, ao preencher formulários de assinatura ou contato. Também podemos coletar informações sobre seu uso dos nossos serviços, como dados de tráfego e localização para viabilidade técnica.",
    },
    {
      icon: <Cookie className="h-6 w-6 text-primary" />,
      title: "Uso de Cookies e Tecnologias de Rastreamento",
      content:
        "Utilizamos cookies e tecnologias similares para entender como você interage com nosso site, personalizar sua experiência, analisar o desempenho de nossas campanhas e oferecer publicidade relevante. Você pode gerenciar suas preferências de cookies a qualquer momento através do nosso banner de consentimento.",
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Como Usamos Suas Informações",
      content:
        "Suas informações são utilizadas para: (a) fornecer, manter e melhorar nossos serviços; (b) processar transações e enviar informações relacionadas, incluindo confirmações e faturas; (c) responder aos seus comentários, perguntas e solicitações de suporte; (d) comunicar sobre produtos, serviços, ofertas e eventos.",
    },
    {
      icon: <Server className="h-6 w-6 text-primary" />,
      title: "Compartilhamento e Armazenamento de Dados",
      content:
        "Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para a prestação dos serviços (como instalação), para cumprir obrigações legais ou com seu consentimento explícito. Seus dados são armazenados em servidores seguros, protegidos com as melhores práticas de segurança do mercado.",
    },
    {
      icon: <Gavel className="h-6 w-6 text-primary" />,
      title: "Seus Direitos e Escolhas",
      content:
        "Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Também pode optar por não receber nossas comunicações de marketing. Para exercer esses direitos, entre em contato conosco através dos nossos canais de atendimento.",
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "Contato",
      content:
        "Se você tiver alguma dúvida ou preocupação sobre nossa política de privacidade ou práticas de dados, não hesite em nos contatar. Estamos disponíveis através da seção de Contato do nosso site para esclarecer qualquer questão.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-neutral-900/50 border-b border-white/5 py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                 <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Política de Privacidade</h1>
                <p className="mt-4 text-lg text-white/70">
                    Última atualização: 08 de Setembro de 2025.
                </p>
                 <p className="mt-2 text-sm text-white/60">Sua confiança é nosso maior ativo. Entenda como cuidamos dos seus dados.</p>
            </div>
        </div>

        <div className="py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
                {policySections.map((section) => (
                    <div key={section.title} className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                            {section.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                            <p className="text-white/70 leading-relaxed">{section.content}</p>
                        </div>
                    </div>
                ))}

                 <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-white/70">Para voltar à página inicial, clique abaixo.</p>
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
