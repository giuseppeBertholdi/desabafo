'use client'

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-pink-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 pb-12 border-b border-pink-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-3xl mx-auto leading-relaxed">
            <strong className="font-medium text-gray-700 dark:text-gray-300">Aviso importante:</strong> o desabafo não é uma ferramenta médica e não se destina a tratar, curar, prevenir ou diagnosticar qualquer condição médica ou de saúde mental. não substitui terapia profissional ou tratamento médico. se você estiver enfrentando uma emergência médica ou de saúde mental, procure ajuda profissional imediatamente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium text-xl mb-4">desabafo 💭</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">não é terapia. é só desabafo.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              uma IA pra te ouvir, sempre.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-4 text-sm">produto</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  recursos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('precos')}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  dúvidas
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-4 text-sm">legal</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  termos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  aviso médico
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-4 text-sm">contato</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href="mailto:oi@desabafo.com" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  oi@desabafo.com
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  suporte
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-pink-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            feito com 💜 por pessoas que acreditam em autocuidado
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            © {new Date().getFullYear()} desabafo
          </p>
        </div>
      </div>
    </footer>
  )
}

