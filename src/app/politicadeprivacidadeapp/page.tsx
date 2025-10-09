
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Shield } from "lucide-react";
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
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose dark:prose-invert">
            <h2>1. Coleta de Informações</h2>
            <p>Quando você utiliza o aplicativo da Velpro Telecom, podemos coletar as seguintes informações:</p>
            <ul>
                <li><strong>Informações Pessoais:</strong> Nome, endereço de e-mail, número de telefone e outras informações de contato que você fornece ao criar uma conta ou ao entrar em contato conosco.</li>
                <li><strong>Informações de Uso:</strong> Dados sobre como você interage com nosso aplicativo, como as páginas que visita, os recursos que utiliza e as ações que realiza.</li>
                <li><strong>Informações de Dispositivo:</strong> Informações sobre o dispositivo que você usa para acessar nosso aplicativo, incluindo o modelo do dispositivo, sistema operacional, endereço IP, e identificadores exclusivos de dispositivo.</li>
            </ul>
            <h2>2. Uso das Informações</h2>
            <p>A Velpro Telecom utiliza as informações coletadas para:</p>
            <ul>
                <li><strong>Fornecer e Melhorar Serviços:</strong> Utilizar suas informações para fornecer, manter, e melhorar nossos serviços e recursos.</li>
                <li><strong>Comunicação:</strong> Enviar notificações importantes, atualizações, e informações sobre novos produtos ou serviços.</li>
                <li><strong>Suporte ao Cliente:</strong> Responder a suas dúvidas, solicitações e fornecer suporte técnico.</li>
                <li><strong>Segurança:</strong> Proteger a segurança e a integridade do nosso aplicativo, detectando e prevenindo fraudes, abusos, ou outras atividades prejudiciais.</li>
            </ul>
            <h2>3. Compartilhamento de Informações</h2>
            <p>A Velpro Telecom não vende, aluga ou compartilha suas informações pessoais com terceiros, exceto nos seguintes casos:</p>
            <ul>
                <li><strong>Com Provedores de Serviço:</strong> Podemos compartilhar suas informações com fornecedores e parceiros que nos ajudam a operar nosso aplicativo e fornecer nossos serviços.</li>
                <li><strong>Para Cumprir a Lei:</strong> Podemos divulgar suas informações quando acreditarmos que é necessário para cumprir a lei, regulamentos ou uma ordem judicial.</li>
                <li><strong>Com seu Consentimento:</strong> Quando você nos dá permissão para compartilhar suas informações em situações específicas.</li>
            </ul>
            <h2>4. Proteção de Informações</h2>
            <p>A Velpro Telecom implementa medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Essas medidas incluem criptografia, firewalls e outras tecnologias de segurança.</p>
            <h2>5. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul>
                <li><strong>Acessar:</strong> Solicitar uma cópia das informações pessoais que possuímos sobre você.</li>
                <li><strong>Corrigir:</strong> Corrigir ou atualizar suas informações pessoais se estiverem incorretas.</li>
                <li><strong>Excluir:</strong> Solicitar a exclusão de suas informações pessoais.</li>
                <li><strong>Revogar Consentimento:</strong> Retirar seu consentimento para o uso das suas informações a qualquer momento.</li>
            </ul>
            <p>Para exercer esses direitos, entre em contato conosco através dos canais fornecidos no aplicativo.</p>
            <h2>6. Alterações na Política de Privacidade</h2>
            <p>A Velpro Telecom pode atualizar esta Política de Privacidade periodicamente. Quando o fizermos, publicaremos a nova política no aplicativo e atualizaremos a data de vigência. Recomendamos que você revise esta política regularmente.</p>
            <h2>7. Contato</h2>
            <p>Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre o tratamento das suas informações, entre em contato conosco através do e-mail <strong>velpro@velpro.net.br</strong> ou pelo telefone <a href="tel:08003810404">0800 381 0404</a>.</p>

            <div className="text-center pt-8 border-t border-border not-prose">
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
