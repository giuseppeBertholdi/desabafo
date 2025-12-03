'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Aplicar tema inicial
    const applyTheme = () => {
      const theme = localStorage.getItem('theme') || 'light'
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    applyTheme()

    // Escutar mudanças no localStorage (quando o tema muda em outra aba/janela)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme()
      }
    }

    // Escutar mudanças customizadas (quando o tema muda na mesma aba)
    const handleThemeChange = () => {
      applyTheme()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('themechange', handleThemeChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('themechange', handleThemeChange)
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}


