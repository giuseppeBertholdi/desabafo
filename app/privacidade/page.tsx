import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade | desabafo.io',
  description: 'política de privacidade do desabafo.io. saiba como protegemos seus dados pessoais e respeitamos sua privacidade. conformidade com LGPD.',
  keywords: [
    'política de privacidade',
    'privacidade desabafo.io',
    'LGPD',
    'proteção de dados',
    'privacidade online',
    'dados pessoais',
  ],
  openGraph: {
    title: 'Política de Privacidade | desabafo.io',
    description: 'política de privacidade do desabafo.io. saiba como protegemos seus dados pessoais.',
    url: 'https://desabafo.io/privacidade',
  },
  alternates: {
    canonical: 'https://desabafo.io/privacidade',
  },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link 
          href="/"
          className="inline-block mb-8 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors text-sm font-medium"
        >
          ← voltar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          política de privacidade
        </h1>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. introdução
            </h2>
            <p className="leading-relaxed">
              o desabafo.io está comprometido em proteger sua privacidade. esta política de privacidade descreve como 
              coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você usa nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. informações que coletamos
            </h2>
            <p className="leading-relaxed mb-3">
              coletamos os seguintes tipos de informações:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2.1. informações fornecidas por você
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>nome, email e outras informações de perfil</li>
                  <li>conteúdo das conversas e mensagens</li>
                  <li>informações de pagamento (processadas por provedores terceirizados seguros)</li>
                  <li>preferências e configurações da conta</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2.2. informações coletadas automaticamente
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>dados de uso do serviço (horários, frequência, recursos utilizados)</li>
                  <li>informações do dispositivo e navegador</li>
                  <li>endereço IP e localização aproximada</li>
                  <li>cookies e tecnologias similares</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. como usamos suas informações
            </h2>
            <p className="leading-relaxed mb-3">
              usamos suas informações para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>fornecer, manter e melhorar nossos serviços</li>
              <li>personalizar sua experiência e conteúdo das conversas</li>
              <li>processar pagamentos e gerenciar assinaturas</li>
              <li>enviar notificações importantes sobre o serviço</li>
              <li>detectar e prevenir fraudes ou uso indevido</li>
              <li>cumprir obrigações legais e regulatórias</li>
              <li>analisar tendências e melhorar nossos serviços</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. compartilhamento de informações
            </h2>
            <p className="leading-relaxed mb-3">
              não vendemos suas informações pessoais. podemos compartilhar suas informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>provedores de serviços:</strong> compartilhamos com empresas que nos ajudam a operar o serviço 
                (hospedagem, processamento de pagamentos, análise de dados), sujeitos a acordos de confidencialidade
              </li>
              <li>
                <strong>requisitos legais:</strong> quando exigido por lei, ordem judicial ou processo legal
              </li>
              <li>
                <strong>proteção de direitos:</strong> para proteger nossos direitos, propriedade ou segurança, 
                ou de nossos usuários
              </li>
              <li>
                <strong>com seu consentimento:</strong> em outras situações, quando você nos der permissão explícita
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. segurança dos dados
            </h2>
            <p className="leading-relaxed">
              implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações 
              contra acesso não autorizado, alteração, divulgação ou destruição. isso inclui criptografia, controles 
              de acesso e monitoramento regular de segurança. no entanto, nenhum método de transmissão pela internet 
              ou armazenamento eletrônico é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. retenção de dados
            </h2>
            <p className="leading-relaxed">
              mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços, cumprir obrigações 
              legais, resolver disputas e fazer cumprir nossos acordos. quando você exclui sua conta, excluímos ou 
              anonimizamos suas informações pessoais, exceto quando a retenção é necessária por motivos legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. seus direitos (lgpd)
            </h2>
            <p className="leading-relaxed mb-3">
              de acordo com a lei geral de proteção de dados (lgpd), você tem os seguintes direitos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>acesso:</strong> solicitar uma cópia das informações pessoais que mantemos sobre você
              </li>
              <li>
                <strong>correção:</strong> solicitar a correção de informações imprecisas ou incompletas
              </li>
              <li>
                <strong>exclusão:</strong> solicitar a exclusão de suas informações pessoais
              </li>
              <li>
                <strong>portabilidade:</strong> receber suas informações em formato estruturado e legível por máquina
              </li>
              <li>
                <strong>revogação de consentimento:</strong> retirar seu consentimento para processamento de dados
              </li>
              <li>
                <strong>oposição:</strong> opor-se ao processamento de suas informações pessoais
              </li>
            </ul>
            <p className="leading-relaxed mt-3">
              para exercer esses direitos, entre em contato conosco em{' '}
              <a 
                href="mailto:giuseppe.bertholdi@gmail.com" 
                className="text-pink-600 dark:text-pink-400 hover:underline"
              >
                giuseppe.bertholdi@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8. cookies e tecnologias similares
            </h2>
            <p className="leading-relaxed">
              usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar 
              conteúdo. você pode controlar cookies através das configurações do seu navegador, mas isso pode afetar a 
              funcionalidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. privacidade de menores
            </h2>
            <p className="leading-relaxed">
              o desabafo.io não é destinado a menores de 18 anos. não coletamos intencionalmente informações pessoais de menores. 
              se tomarmos conhecimento de que coletamos informações de um menor, tomaremos medidas para excluir essas informações 
              imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              10. transferência internacional de dados
            </h2>
            <p className="leading-relaxed">
              suas informações podem ser transferidas e processadas em países diferentes do seu país de residência. ao usar 
              nosso serviço, você consente com essa transferência. tomamos medidas para garantir que suas informações recebam 
              um nível adequado de proteção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              11. alterações nesta política
            </h2>
            <p className="leading-relaxed">
              podemos atualizar esta política de privacidade periodicamente. notificaremos você sobre mudanças significativas 
              através do serviço ou por email. recomendamos que você revise esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              12. contato
            </h2>
            <p className="leading-relaxed">
              se você tiver dúvidas, preocupações ou solicitações relacionadas a esta política de privacidade ou ao tratamento 
              de suas informações pessoais, entre em contato conosco em:{' '}
              <a 
                href="mailto:giuseppe.bertholdi@gmail.com" 
                className="text-pink-600 dark:text-pink-400 hover:underline"
              >
                giuseppe.bertholdi@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

