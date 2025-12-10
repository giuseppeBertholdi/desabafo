import { useEffect, useState } from 'react'

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
  reducedMotion: boolean
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') {
      return { fontSize: 'medium', highContrast: false, reducedMotion: false }
    }

    const saved = localStorage.getItem('accessibilitySettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { fontSize: 'medium', highContrast: false, reducedMotion: false }
      }
    }
    return { fontSize: 'medium', highContrast: false, reducedMotion: false }
  })

  useEffect(() => {
    // Aplicar preferências do sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }

    // Aplicar configurações ao documento
    const root = document.documentElement
    root.setAttribute('data-font-size', settings.fontSize)
    root.setAttribute('data-high-contrast', settings.highContrast.toString())
    root.setAttribute('data-reduced-motion', settings.reducedMotion.toString())
  }, [settings])

  const updateFontSize = (size: 'small' | 'medium' | 'large') => {
    const newSettings = { ...settings, fontSize: size }
    setSettings(newSettings)
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))
  }

  const toggleHighContrast = () => {
    const newSettings = { ...settings, highContrast: !settings.highContrast }
    setSettings(newSettings)
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))
  }

  const toggleReducedMotion = () => {
    const newSettings = { ...settings, reducedMotion: !settings.reducedMotion }
    setSettings(newSettings)
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))
  }

  return {
    settings,
    updateFontSize,
    toggleHighContrast,
    toggleReducedMotion,
  }
}

// Hook para atalhos de teclado
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc para fechar modais
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[data-modal="true"]')
        const openModal = Array.from(modals).find(modal => {
          const style = window.getComputedStyle(modal as HTMLElement)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        
        if (openModal) {
          const closeButton = (openModal as HTMLElement).querySelector('[data-close-modal]')
          if (closeButton) {
            (closeButton as HTMLElement).click()
          }
        }
      }

      // Ctrl/Cmd + K para focar busca (se existir)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) {
          e.preventDefault()
          searchInput.focus()
        }
      }

      // Ctrl/Cmd + / para mostrar ajuda
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        const helpButton = document.querySelector('[data-help-button]') as HTMLElement
        if (helpButton) {
          helpButton.click()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

