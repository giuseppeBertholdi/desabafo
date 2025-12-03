'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home'
    }
    if (path === '/history') {
      return pathname === '/history'
    }
    if (path === '/chat') {
      return pathname?.startsWith('/chat')
    }
    if (path === '/insights') {
      return pathname === '/insights'
    }
    if (path === '/journal') {
      return pathname === '/journal'
    }
    if (path === '/pricing') {
      return pathname === '/pricing'
    }
    if (path === '/account') {
      return pathname === '/account'
    }
    return false
  }

  return (
    <div className="fixed left-6 sm:left-8 top-1/2 -translate-y-1/2 z-50">
      {/* Fundo blur */}
      <div className="absolute inset-0 -left-4 -right-4 -top-4 -bottom-4 bg-gradient-to-br from-pink-50/15 via-purple-50/10 to-pink-50/15 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 backdrop-blur-md rounded-2xl" />
      
      {/* Ícones */}
      <div className="relative flex flex-col gap-6 sm:gap-8 px-4 py-4">
        <button 
          onClick={() => router.push('/home')}
          className={`transition-colors cursor-pointer pointer-events-auto ${
            isActive('/home') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Home"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        
        <button 
          onClick={() => router.push('/history')}
          className={`transition-colors cursor-pointer pointer-events-auto ${
            isActive('/history') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Histórico de conversas"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button 
          onClick={() => router.push('/insights')}
          className={`transition-colors cursor-pointer pointer-events-auto ${
            isActive('/insights') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Insights"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        
        <button 
          onClick={() => router.push('/journal')}
          className={`transition-colors cursor-pointer pointer-events-auto ${
            isActive('/journal') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Diário"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
        
        <button 
          onClick={() => router.push('/pricing')}
          className={`transition-colors cursor-pointer pointer-events-auto ${
            isActive('/pricing') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Preços"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </button>
        
        {/* Botão Conta */}
        <button 
          onClick={() => router.push('/account')}
          className={`transition-colors cursor-pointer pointer-events-auto mt-auto ${
            isActive('/account') ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
          title="Conta"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

