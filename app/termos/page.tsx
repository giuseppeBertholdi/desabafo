import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso - desabafo.io',
  description: 'Termos de uso do desabafo.io',
}

export default function TermosPage() {
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
          termos de uso
        </h1>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. aceitação dos termos
            </h2>
            <p className="leading-relaxed">
              ao acessar e usar o desabafo.io, você concorda em cumprir e estar vinculado a estes termos de uso. 
              se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. descrição do serviço
            </h2>
            <p className="leading-relaxed">
              o desabafo.io é uma plataforma de conversação com inteligência artificial projetada para oferecer 
              um espaço seguro para desabafos e reflexões. não é uma ferramenta médica, psicológica ou terapêutica 
              e não substitui tratamento profissional de saúde mental.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. uso adequado
            </h2>
            <p className="leading-relaxed mb-3">
              você concorda em usar o desabafo.io apenas para fins legais e de acordo com estes termos. você não deve:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>usar o serviço para qualquer propósito ilegal ou não autorizado</li>
              <li>tentar acessar áreas restritas do serviço ou sistemas relacionados</li>
              <li>interferir ou interromper o funcionamento do serviço</li>
              <li>transmitir qualquer conteúdo que seja ofensivo, difamatório ou prejudicial</li>
              <li>usar o serviço para spam ou comunicação não solicitada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. conta e segurança
            </h2>
            <p className="leading-relaxed mb-3">
              ao criar uma conta, você é responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>manter a confidencialidade de suas credenciais de acesso</li>
              <li>todas as atividades que ocorrem sob sua conta</li>
              <li>notificar-nos imediatamente sobre qualquer uso não autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. privacidade e dados
            </h2>
            <p className="leading-relaxed">
              o uso de seus dados pessoais é regido por nossa política de privacidade. ao usar o desabafo.io, 
              você concorda com a coleta e uso de informações conforme descrito na política de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. planos e pagamentos
            </h2>
            <p className="leading-relaxed mb-3">
              alguns recursos do desabafo.io podem estar disponíveis apenas mediante assinatura de planos pagos. 
              ao assinar um plano pago, você concorda em:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>pagar todas as taxas associadas ao plano escolhido</li>
              <li>renovação automática conforme os termos do plano</li>
              <li>cancelar sua assinatura conforme os procedimentos estabelecidos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. limitação de responsabilidade
            </h2>
            <p className="leading-relaxed">
              o desabafo.io é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. não garantimos que o serviço será 
              ininterrupto, seguro ou livre de erros. não nos responsabilizamos por quaisquer danos diretos, 
              indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de usar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8. aviso médico
            </h2>
            <p className="leading-relaxed">
              o desabafo.io não é uma ferramenta médica e não se destina a tratar, curar, prevenir ou diagnosticar 
              qualquer condição médica ou de saúde mental. não substitui terapia profissional, tratamento médico 
              ou aconselhamento psicológico. se você estiver enfrentando uma emergência médica ou de saúde mental, 
              procure ajuda profissional imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. propriedade intelectual
            </h2>
            <p className="leading-relaxed">
              todo o conteúdo do desabafo.io, incluindo textos, gráficos, logos, ícones e software, é propriedade 
              do desabafo.io ou de seus licenciadores e está protegido por leis de direitos autorais e outras leis 
              de propriedade intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              10. modificações dos termos
            </h2>
            <p className="leading-relaxed">
              reservamo-nos o direito de modificar estes termos a qualquer momento. notificaremos os usuários sobre 
              mudanças significativas através do serviço ou por email. o uso continuado do serviço após as alterações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              11. rescisão
            </h2>
            <p className="leading-relaxed">
              podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer 
              motivo, incluindo violação destes termos de uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              12. lei aplicável
            </h2>
            <p className="leading-relaxed">
              estes termos são regidos pelas leis do brasil. qualquer disputa relacionada a estes termos será resolvida 
              nos tribunais competentes do brasil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              13. contato
            </h2>
            <p className="leading-relaxed">
              se você tiver dúvidas sobre estes termos de uso, entre em contato conosco em:{' '}
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

