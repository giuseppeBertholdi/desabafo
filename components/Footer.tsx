'use client'

export default function Footer() {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-pink-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 pb-8 sm:pb-12 border-b border-pink-100 dark:border-gray-800">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-3xl mx-auto leading-relaxed px-2">
            <strong className="font-medium text-gray-700 dark:text-gray-300">Aviso importante:</strong> o desabafo não é uma ferramenta médica e não se destina a tratar, curar, prevenir ou diagnosticar qualquer condição médica ou de saúde mental. não substitui terapia profissional ou tratamento médico. se você estiver enfrentando uma emergência médica ou de saúde mental, procure ajuda profissional imediatamente.
          </p>
        </div>
        
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium text-lg sm:text-xl mb-2">desabafo 💭</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">não é terapia. é só desabafo.</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="/termos" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              termos de uso
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/privacidade" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              privacidade
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="mailto:giuseppe.bertholdi@gmail.com" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              giuseppe.bertholdi@gmail.com
            </a>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-pink-100 dark:border-gray-800 text-center px-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} desabafo
          </p>
        </div>
      </div>
    </footer>
  )
}

