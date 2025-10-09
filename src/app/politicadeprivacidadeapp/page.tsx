
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Shield, FileText, Users, Cog, Share2, Gavel, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade do App - Velpro Telecom',
  description: 'Política de privacidade para o aplicativo da Velpro Telecom.',
  robots: {
    index: false,
    follow: false,
  }
};

const policySections = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Coleta de Informações",
      content: "Quando você utiliza o aplicativo da Velpro Telecom, podemos coletar as seguintes informações: Informações Pessoais (Nome, e-mail, telefone), Informações de Uso (interações com o app) e Informações de Dispositivo (modelo, SO, IP)."
    },
    {
      icon: <Cog className="h-6 w-6 text-primary" />,
      title: "Uso das Informações",
      content: "A Velpro Telecom utiliza as informações coletadas para: Fornecer e Melhorar Serviços, Comunicação (notificações, atualizações), Suporte ao Cliente e para proteger a segurança e a integridade do nosso aplicativo."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Compartilhamento de Informações",
      content: "A Velpro Telecom não vende ou aluga suas informações. Podemos compartilhar dados com Provedores de Serviço que nos ajudam a operar, para Cumprir a Lei, ou com seu Consentimento explícito."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Proteção de Informações",
      content: "Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Essas medidas incluem criptografia, firewalls e outras tecnologias de segurança."
    },
    {
      icon: <Gavel className="h-6 w-6 text-primary" />,
      title: "Seus Direitos",
      content: "Você tem o direito de Acessar, Corrigir, Excluir suas informações ou Revogar seu consentimento. Para exercer esses direitos, entre em contato conosco através dos canais fornecidos no aplicativo."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-primary" />,
      title: "Alterações na Política de Privacidade",
      content: "A Velpro Telecom pode atualizar esta Política de Privacidade periodicamente. Quando o fizermos, publicaremos a nova política no aplicativo e atualizaremos a data de vigência. Recomendamos que você revise esta política regularmente."
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "Contato",
      content: "Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco através do e-mail velpro@velpro.net.br ou pelo telefone 0800 381 0404."
    }
];

export default function PrivacyPolicyAppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-secondary border-b border-border py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Política de Privacidade do App</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Data de Vigência: 03/09/2024
            </p>
          </div>
        </div>

        <div className="py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            {policySections.map((section) => (
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
