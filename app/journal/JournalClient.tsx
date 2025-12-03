'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import { JournalEntriesSkeleton, TextAreaSkeleton } from '@/components/Skeletons'

interface JournalEntry {
  id: string
  content: string
  tags: string[]
  mood?: string
  created_at: string
  updated_at: string
}

export default function JournalClient({ firstName }: { firstName: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'write' | 'read'>('write')
  const [showStats, setShowStats] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [writingStreak, setWritingStreak] = useState(0)
  const [showPrompts, setShowPrompts] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [zenMode, setZenMode] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showMoodChart, setShowMoodChart] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showQuickNote, setShowQuickNote] = useState(false)
  const [quickNoteText, setQuickNoteText] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [tagInputPosition, setTagInputPosition] = useState({ top: 0, left: 0 })
  const [currentTagQuery, setCurrentTagQuery] = useState('')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tagSuggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const moods = [
    { emoji: '😊', label: 'feliz', value: 'feliz' },
    { emoji: '😌', label: 'calmo', value: 'calmo' },
    { emoji: '😰', label: 'ansioso', value: 'ansioso' },
    { emoji: '😔', label: 'triste', value: 'triste' },
    { emoji: '😤', label: 'irritado', value: 'irritado' },
    { emoji: '🤔', label: 'reflexivo', value: 'reflexivo' },
    { emoji: '😴', label: 'cansado', value: 'cansado' },
    { emoji: '😄', label: 'animado', value: 'animado' },
  ]

  const prompts = [
    'como você está se sentindo neste momento?',
    'o que te trouxe alegria hoje?',
    'quais foram os desafios que você enfrentou?',
    'o que você aprendeu sobre si mesmo hoje?',
    'pelo que você é grato hoje?',
    'o que você gostaria de mudar?',
    'como você se sentiu em relação às pessoas ao seu redor?',
    'o que te deixou preocupado ou ansioso?',
    'quais foram os momentos mais significativos do dia?',
    'como você cuidou de si mesmo hoje?',
    'o que você quer lembrar deste dia?',
    'quais são seus sonhos e aspirações?',
  ]

  const templates = [
    {
      name: 'gratidão',
      icon: '🙏',
      content: 'hoje sou grato por:\n\n1. \n2. \n3. \n\npor que isso importa:'
    },
    {
      name: 'reflexão do dia',
      icon: '🌅',
      content: 'como foi meu dia?\n\npontos altos:\n\npontos baixos:\n\no que aprendi:'
    },
    {
      name: 'ansiedade',
      icon: '😰',
      content: 'o que está me deixando ansioso:\n\ncomo me sinto fisicamente:\n\no que posso fazer para me acalmar:\n\nlembretes gentis para mim:'
    },
    {
      name: 'sonhos',
      icon: '💭',
      content: 'meus sonhos e objetivos:\n\no que preciso fazer para alcançá-los:\n\nobstáculos que enfrento:\n\ncomo me sinto sobre isso:'
    },
    {
      name: 'relacionamentos',
      icon: '💕',
      content: 'sobre relacionamentos hoje:\n\ncomo me senti com as pessoas:\n\no que quero melhorar:\n\npelo que sou grato nas minhas relações:'
    },
    {
      name: 'autocuidado',
      icon: '🧘',
      content: 'como cuidei de mim hoje:\n\no que fiz bem:\n\no que posso melhorar:\n\ncomo me sinto agora:'
    },
  ]

  useEffect(() => {
    loadEntries()
  }, [])

  // Fechar sugestões de tags ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showTagSuggestions && textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('.fixed.z-50')) {
          setShowTagSuggestions(false)
        }
      }
    }

    if (showTagSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showTagSuggestions])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
    
    // Atualizar contadores
    const words = currentEntry.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setCharacterCount(currentEntry.length)
  }, [currentEntry])

  // Calcular streak de escrita
  useEffect(() => {
    if (entries.length === 0) {
      setWritingStreak(0)
      return
    }

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].created_at)
      entryDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }

    setWritingStreak(streak)
  }, [entries])

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Erro ao carregar entradas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Gerar sugestão de auto-complete
  const generateSuggestion = useCallback(async (text: string) => {
    if (text.length < 10 || text.length > 200) {
      setSuggestion(null)
      setShowSuggestion(false)
      return
    }

    // Só sugerir se a última palavra estiver incompleta ou após pontuação
    const lastChar = text[text.length - 1]
    const words = text.trim().split(/\s+/)
    const lastWord = words[words.length - 1]

    // Não sugerir se acabou de terminar uma frase completa
    if (['.', '!', '?'].includes(lastChar) && lastWord.length > 3) {
      setSuggestion(null)
      setShowSuggestion(false)
      return
    }

    try {
      const response = await fetch('/api/journal/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const { suggestion: suggestionText } = await response.json()
        if (suggestionText && suggestionText.length < 100) {
          setSuggestion(suggestionText)
          setShowSuggestion(true)
        } else {
          setSuggestion(null)
          setShowSuggestion(false)
        }
      } else {
        setSuggestion(null)
        setShowSuggestion(false)
      }
    } catch (error) {
      // Silenciosamente falhar - não queremos que erros quebrem a experiência
      setSuggestion(null)
      setShowSuggestion(false)
    }
  }, [])

  const handleTextChange = (value: string) => {
    setCurrentEntry(value)
    setShowSuggestion(false)

    // Limpar timeout anterior
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }

    // Detectar tags
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart
      detectTagInput(value, cursorPosition)
    }

    // Aguardar 1.5s após parar de digitar antes de sugerir
    if (value.length > 10) {
      suggestionTimeoutRef.current = setTimeout(() => {
        generateSuggestion(value)
      }, 1500)
    } else {
      setSuggestion(null)
    }

    // Atualizar contadores
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setCharacterCount(value.length)
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Se estiver mostrando sugestões de tags e pressionar Enter ou Tab, inserir primeira sugestão
    if (showTagSuggestions && tagSuggestions.length > 0) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertTag(tagSuggestions[0])
      } else if (e.key === 'Escape') {
        setShowTagSuggestions(false)
      }
    }
  }

  const applyTemplate = (template: typeof templates[0]) => {
    setCurrentEntry(template.content)
    setSelectedTemplate(template.name)
    setShowTemplates(false)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const applyPrompt = (prompt: string) => {
    if (currentEntry.trim()) {
      setCurrentEntry(currentEntry + '\n\n' + prompt + '\n')
    } else {
      setCurrentEntry(prompt + '\n')
    }
    setSelectedPrompt(prompt)
    setShowPrompts(false)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const saveQuickNote = async () => {
    if (!quickNoteText.trim()) return
    
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: quickNoteText.trim(),
          tags: [],
          mood: null
        })
        .select()
        .single()

      if (error) throw error

      setEntries(prev => [data, ...prev])
      setQuickNoteText('')
      setShowQuickNote(false)
    } catch (error) {
      console.error('Erro ao salvar nota rápida:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Agrupar entradas por data para calendário
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, JournalEntry[]>)

  // Coletar todas as tags existentes
  const allTags = Array.from(new Set(
    entries.flatMap(entry => entry.tags)
  )).sort()

  // Detectar quando está digitando uma tag
  const detectTagInput = (text: string, cursorPosition: number) => {
    const textBeforeCursor = text.substring(0, cursorPosition)
    const lastHashIndex = textBeforeCursor.lastIndexOf('#')
    
    if (lastHashIndex === -1) {
      setShowTagSuggestions(false)
      setCurrentTagQuery('')
      return
    }

    // Verificar se há espaço após o #
    const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1)
    if (textAfterHash.includes(' ') || textAfterHash.includes('\n')) {
      setShowTagSuggestions(false)
      setCurrentTagQuery('')
      return
    }

    // Obter a query atual da tag
    const query = textAfterHash.toLowerCase()
    setCurrentTagQuery(query)

    // Filtrar tags que começam com a query (ou mostrar todas se query estiver vazia)
    const filtered = query === '' 
      ? allTags 
      : allTags.filter(tag => 
          tag.toLowerCase().startsWith(query) && tag.toLowerCase() !== query
        )

    if (filtered.length > 0) {
      setTagSuggestions(filtered.slice(0, 8)) // Máximo 8 sugestões
      
      // Calcular posição do cursor no textarea
      if (textareaRef.current) {
        const textarea = textareaRef.current
        const rect = textarea.getBoundingClientRect()
        const style = window.getComputedStyle(textarea)
        const paddingLeft = parseInt(style.paddingLeft) || 24
        const paddingTop = parseInt(style.paddingTop) || 24
        const lineHeight = parseInt(style.lineHeight) || 24
        const fontSize = parseInt(style.fontSize) || 16
        
        // Calcular posição do cursor
        const textBeforeCursor = text.substring(0, cursorPosition)
        const textBeforeHash = text.substring(0, lastHashIndex)
        const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1)
        
        // Criar elemento temporário para medir
        const measureDiv = document.createElement('div')
        measureDiv.style.position = 'absolute'
        measureDiv.style.visibility = 'hidden'
        measureDiv.style.whiteSpace = 'pre-wrap'
        measureDiv.style.font = style.font
        measureDiv.style.width = (textarea.offsetWidth - paddingLeft * 2) + 'px'
        measureDiv.style.padding = style.padding
        measureDiv.textContent = textBeforeHash
        document.body.appendChild(measureDiv)
        
        const hashHeight = measureDiv.offsetHeight
        
        // Medir largura do texto após o #
        const measureHash = document.createElement('span')
        measureHash.style.position = 'absolute'
        measureHash.style.visibility = 'hidden'
        measureHash.style.font = style.font
        measureHash.textContent = textAfterHash
        document.body.appendChild(measureHash)
        
        const hashWidth = measureHash.offsetWidth
        
        document.body.removeChild(measureDiv)
        document.body.removeChild(measureHash)
        
        setTagInputPosition({
          top: rect.top + hashHeight + paddingTop + lineHeight + 5,
          left: rect.left + paddingLeft + hashWidth + 8
        })
      }
      
      setShowTagSuggestions(true)
    } else {
      setShowTagSuggestions(false)
    }
  }

  const insertTag = (tag: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = currentEntry
    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = text.substring(0, cursorPosition)
    const lastHashIndex = textBeforeCursor.lastIndexOf('#')
    
    if (lastHashIndex === -1) return

    const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1)
    const newText = 
      text.substring(0, lastHashIndex) + 
      '#' + tag + 
      ' ' + 
      text.substring(cursorPosition)
    
    setCurrentEntry(newText)
    setShowTagSuggestions(false)
    setCurrentTagQuery('')
    
    // Reposicionar cursor após a tag
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = lastHashIndex + tag.length + 2
        textareaRef.current.setSelectionRange(newPosition, newPosition)
        textareaRef.current.focus()
      }
    }, 0)
  }

  const acceptSuggestion = () => {
    if (suggestion) {
      const newText = currentEntry + ' ' + suggestion
      setCurrentEntry(newText)
      setSuggestion(null)
      setShowSuggestion(false)
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newText.length, newText.length)
      }
    }
  }

  const saveEntry = async () => {
    if (!currentEntry.trim()) return

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // Verificar plano do usuário e limitar entradas se for free
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        // Plano free: verificar limite de 10 entradas
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (count && count >= 10) {
          alert('Limite de 10 entradas atingido. Faça upgrade para o plano Pro para entradas ilimitadas.')
          setIsSaving(false)
          router.push('/pricing')
          return
        }
      }

      // Extrair tags simples (palavras com #)
      const tagMatches = currentEntry.match(/#\w+/g) || []
      const tags = tagMatches.map(tag => tag.substring(1).toLowerCase())

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: currentEntry.trim(),
          tags: tags.length > 0 ? tags : [],
          mood: selectedMood || null
        })
        .select()
        .single()

      if (error) throw error

      setEntries(prev => [data, ...prev])
      setCurrentEntry('')
      setSelectedMood(null)
      setSuggestion(null)
      setShowSuggestion(false)
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return entry.content.toLowerCase().includes(query) ||
             entry.tags.some(tag => tag.toLowerCase().includes(query))
    }
    return true
  })

  const selectedEntryData = entries.find(e => e.id === selectedEntry)

  // Estatísticas
  const totalWords = entries.reduce((acc, entry) => {
    return acc + entry.content.split(/\s+/).filter(word => word.length > 0).length
  }, 0)

  const totalEntries = entries.length
  const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0
  const mostUsedMood = entries
    .filter(e => e.mood)
    .reduce((acc, entry) => {
      acc[entry.mood!] = (acc[entry.mood!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const topMood = Object.entries(mostUsedMood).sort((a, b) => b[1] - a[1])[0]


  // Gerar insights
  const generateInsights = async () => {
    if (entries.length === 0) return

    setIsGeneratingInsights(true)
    setInsights(null)

    try {
      const recentEntries = entries.slice(0, 10).map(e => ({
        date: formatDate(e.created_at),
        mood: e.mood,
        content: e.content.substring(0, 200)
      }))

      const response = await fetch('/api/journal/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: recentEntries }),
      })

      if (response.ok) {
        const { insights: insightsText } = await response.json()
        setInsights(insightsText)
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  // Deletar entrada
  const handleDeleteEntry = async (entryId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/journal/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId })
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar entrada')
      }

      // Remover da lista
      setEntries(prev => prev.filter(e => e.id !== entryId))
      
      // Se era a entrada selecionada, limpar seleção
      if (selectedEntry === entryId) {
        setSelectedEntry(null)
      }

      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erro ao deletar entrada:', error)
      alert('Erro ao deletar entrada. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 sm:top-8 left-6 sm:left-8 z-10"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight hover:text-pink-500 transition-colors cursor-pointer"
        >
          desabafo
        </button>
      </motion.div>

      <Sidebar />

      <div className="flex min-h-screen pl-20 sm:pl-24">
        {/* Sidebar de entradas */}
        <div className="w-80 border-r border-gray-100 dark:border-gray-800 pt-20 pb-8 overflow-y-auto">
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-900 dark:text-white">diário</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer"
                  title="Estatísticas"
                >
                  📊
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'write' ? 'read' : 'write')}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer"
                >
                  {viewMode === 'write' ? 'ler' : 'escrever'}
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">entradas:</span>
                      <span className="text-gray-900 dark:text-white font-light">{totalEntries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">palavras:</span>
                      <span className="text-gray-900 dark:text-white font-light">{totalWords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">média/entrada:</span>
                      <span className="text-gray-900 dark:text-white font-light">{avgWordsPerEntry} palavras</span>
                    </div>
                    {topMood && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">humor mais comum:</span>
                        <span className="text-gray-900 dark:text-white font-light">
                          {moods.find(m => m.value === topMood[0])?.emoji} {moods.find(m => m.value === topMood[0])?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streak de escrita */}
            {writingStreak > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <p className="text-xs font-light text-pink-700 dark:text-pink-300">
                      {writingStreak} {writingStreak === 1 ? 'dia seguido' : 'dias seguidos'} escrevendo!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setShowQuickNote(true)}
                className="px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer font-light"
              >
                ⚡ nota rápida
              </button>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-3 py-2 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer font-light"
              >
                📅 calendário
              </button>
              <button
                onClick={() => setShowMoodChart(!showMoodChart)}
                disabled={entries.filter(e => e.mood).length === 0}
                className="px-3 py-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-light"
              >
                📊 humor
              </button>
              <button
                onClick={generateInsights}
                disabled={entries.length === 0 || isGeneratingInsights}
                className="px-3 py-2 text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-light"
              >
                {isGeneratingInsights ? 'gerando...' : '💡 insights'}
              </button>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="buscar..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="px-6 text-center py-12">
              <div className="text-4xl mb-3">📔</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                {searchQuery ? 'nenhuma entrada encontrada' : 'nenhuma entrada ainda'}
              </p>
            </div>
          ) : isLoading ? (
            <div className="px-3 space-y-1">
              <JournalEntriesSkeleton count={5} />
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-light">
                    nenhuma entrada ainda. comece a escrever!
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`group relative w-full rounded-lg transition-all ${
                    selectedEntry === entry.id
                      ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedEntry(entry.id)
                      setViewMode('read')
                    }}
                    className="w-full text-left px-3 py-3 pr-10 rounded-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {entry.mood && (
                        <span className="text-base">
                          {moods.find(m => m.value === entry.mood)?.emoji || '📝'}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-light line-clamp-2">
                      {entry.content.substring(0, 80)}...
                    </p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(entry.id)
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 z-10"
                    title="Deletar entrada"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Área principal */}
        <div className="flex-1 pt-20 pb-8">
          {viewMode === 'write' ? (
            <div className="max-w-3xl mx-auto px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12"
              >
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                    {formatDate(new Date().toISOString())}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    como você está se sentindo hoje, {firstName}?
                  </p>
                </div>

                {/* Mood selector */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-2">humor do dia</p>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-light transition-all cursor-pointer ${
                          selectedMood === mood.value
                            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <span className="mr-1.5">{mood.emoji}</span>
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controles de escrita */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowPrompts(!showPrompts)}
                      className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer font-light"
                    >
                      💡 prompts
                    </button>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer font-light"
                    >
                      📝 templates
                    </button>
                    <button
                      onClick={() => setZenMode(!zenMode)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer font-light ${
                        zenMode 
                          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' 
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {zenMode ? '🧘 modo zen' : '🧘 modo normal'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{wordCount} palavras</span>
                    <span>{characterCount} caracteres</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFontSize('small')}
                        className={`px-2 py-1 rounded ${fontSize === 'small' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('medium')}
                        className={`px-2 py-1 rounded ${fontSize === 'medium' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('large')}
                        className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompts */}
                <AnimatePresence>
                  {showPrompts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg"
                    >
                      <p className="text-xs text-pink-700 dark:text-pink-300 font-light mb-3">comece com uma pergunta:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {prompts.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => applyPrompt(prompt)}
                            className="text-left px-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer font-light"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Templates */}
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-light mb-3">escolha um template:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {templates.map((template, i) => (
                          <button
                            key={i}
                            onClick={() => applyTemplate(template)}
                            className="px-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer font-light flex items-center gap-2"
                          >
                            <span>{template.icon}</span>
                            <span>{template.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Textarea sem linhas */}
                <div className={`relative mb-4 ${zenMode ? 'bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6' : ''}`}>
                  <textarea
                    ref={textareaRef}
                    value={currentEntry}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    onSelect={(e) => {
                      if (textareaRef.current) {
                        const cursorPosition = textareaRef.current.selectionStart
                        detectTagInput(currentEntry, cursorPosition)
                      }
                    }}
                    placeholder={selectedPrompt || "escreva o que quiser... seus pensamentos, sentimentos, o que aconteceu hoje..."}
                    className={`w-full min-h-[400px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-light leading-relaxed resize-none focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors ${
                      fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
                    }`}
                  />
                  
                  {/* Sugestões de tags */}
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                      style={{
                        top: `${tagInputPosition.top}px`,
                        left: `${tagInputPosition.left}px`,
                        minWidth: '200px',
                        maxWidth: '300px'
                      }}
                    >
                      <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-2 px-2">
                          suas tags:
                        </p>
                        {tagSuggestions.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => insertTag(tag)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors cursor-pointer font-light flex items-center gap-2"
                          >
                            <span className="text-pink-500">#</span>
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Sugestão de auto-complete */}
                  {showSuggestion && suggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-6 right-6 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-1">
                            sugestão:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-light">
                            {suggestion}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={acceptSuggestion}
                            className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-light hover:bg-pink-600 transition-colors cursor-pointer"
                          >
                            aceitar
                          </button>
                          <button
                            onClick={() => {
                              setSuggestion(null)
                              setShowSuggestion(false)
                            }}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-light hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                          >
                            ignorar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Insights */}
                {insights && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-pink-700 dark:text-pink-300 font-light font-medium">
                        💡 insights sobre seu diário
                      </p>
                      <button
                        onClick={() => setInsights(null)}
                        className="text-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-pink-800 dark:text-pink-200 font-light leading-relaxed">
                      {insights}
                    </p>
                  </motion.div>
                )}

                {/* Dicas */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                    💡 dica: use #tags para organizar seus pensamentos. digite # para ver suas tags existentes
                  </p>
                </div>

                {/* Botão salvar */}
                <button
                  onClick={saveEntry}
                  disabled={!currentEntry.trim() || isSaving}
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-light hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? 'salvando...' : 'salvar entrada'}
                </button>
              </motion.div>
            </div>
          ) : selectedEntryData ? (
            <div className="max-w-3xl mx-auto px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                        {formatDate(selectedEntryData.created_at)}
                      </h1>
                      {selectedEntryData.mood && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {moods.find(m => m.value === selectedEntryData.mood)?.emoji}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-light">
                            {moods.find(m => m.value === selectedEntryData.mood)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setViewMode('write')}
                      className="text-sm text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
                    >
                      nova entrada
                    </button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed whitespace-pre-wrap p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]"
                  >
                    {selectedEntryData.content}
                  </div>
                </div>

                {selectedEntryData.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-2">tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntryData.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-light">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">📔</div>
                <p className="text-gray-500 dark:text-gray-400 font-light">
                  selecione uma entrada para ler
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nota Rápida */}
      <AnimatePresence>
        {showQuickNote && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowQuickNote(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl transition-colors"
            >
              <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">nota rápida</h2>
              <textarea
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                placeholder="escreva uma nota rápida..."
                className="w-full min-h-[200px] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-light leading-relaxed resize-none focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowQuickNote(false)
                    setQuickNoteText('')
                  }}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                >
                  cancelar
                </button>
                <button
                  onClick={saveQuickNote}
                  disabled={!quickNoteText.trim() || isSaving}
                  className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-light hover:bg-pink-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'salvando...' : 'salvar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendário de Entradas */}
      <AnimatePresence>
        {showCalendar && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCalendar(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-gray-900 dark:text-white">calendário</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 font-light py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = new Date()
                  date.setDate(1)
                  date.setDate(date.getDate() + i - date.getDay())
                  const dateStr = date.toDateString()
                  const hasEntry = entriesByDate[dateStr]?.length > 0
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (hasEntry) {
                          setSelectedEntry(entriesByDate[dateStr][0].id)
                          setViewMode('read')
                          setShowCalendar(false)
                        }
                      }}
                      className={`aspect-square rounded-lg text-xs font-light transition-all cursor-pointer ${
                        hasEntry
                          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/40'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light text-center">
                dias com entradas aparecem em rosa
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gráfico de Humor */}
      <AnimatePresence>
        {showMoodChart && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMoodChart(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-gray-900 dark:text-white">seu humor ao longo do tempo</h2>
                <button
                  onClick={() => setShowMoodChart(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {moods.map(mood => {
                  const count = entries.filter(e => e.mood === mood.value).length
                  const percentage = entries.filter(e => e.mood).length > 0 
                    ? (count / entries.filter(e => e.mood).length) * 100 
                    : 0
                  return (
                    <div key={mood.value} className="flex items-center gap-3">
                      <div className="w-12 text-center">
                        <span className="text-xl">{mood.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-light text-gray-700 dark:text-gray-300">{mood.label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{count} vezes</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmação de deleção */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(null)
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl transition-colors"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                tem certeza?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                essa ação não pode ser desfeita. esta entrada do diário será deletada permanentemente.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto disabled:opacity-50"
                type="button"
              >
                cancelar
              </button>
              <button
                onClick={() => handleDeleteEntry(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-light hover:bg-red-700 transition-all cursor-pointer pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isDeleting ? 'deletando...' : 'deletar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

