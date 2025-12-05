'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from '@/components/Sidebar'
import ProBanner from '@/components/ProBanner'
import { ChatMessagesSkeleton } from '@/components/Skeletons'
import { useUserPlan } from '@/lib/getUserPlanClient'
import { useRealtimeMini } from '@/hooks/useRealtimeMini'
import { useToast } from '@/contexts/ToastContext'

interface ChatClientProps {
  firstName: string
  tema?: string
  voiceMode?: boolean
}

// Mapeamento de temas com emojis, nomes e mensagens iniciais
const temasMap: Record<string, { emoji: string; nome: string; mensagemInicial: string; contexto: string }> = {
  'ansiedade': {
    emoji: '😰',
    nome: 'ansiedade',
    mensagemInicial: 'oi! vejo que você quer conversar sobre ansiedade. como você tá se sentindo agora?',
    contexto: 'ansiedade é uma resposta natural do nosso corpo, mas pode ser muito difícil de lidar. aqui você pode desabafar sobre o que tá te deixando ansioso sem julgamentos.'
  },
  'relacionamento': {
    emoji: '💔',
    nome: 'relacionamento',
    mensagemInicial: 'oi! relacionamentos podem ser complexos né? me conta o que tá rolando.',
    contexto: 'relacionamentos trazem muitas emoções - amor, frustração, dúvidas, alegria. aqui é um espaço seguro pra você falar sobre o que tá sentindo.'
  },
  'trabalho': {
    emoji: '💼',
    nome: 'trabalho',
    mensagemInicial: 'oi! trabalho pode ser uma fonte de muito estresse. o que tá te incomodando?',
    contexto: 'o ambiente de trabalho pode gerar pressão, conflitos, insegurança e até burnout. você pode desabafar sobre qualquer coisa relacionada ao trabalho aqui.'
  },
  'tristeza': {
    emoji: '😔',
    nome: 'tristeza',
    mensagemInicial: 'oi. vejo que você tá passando por um momento difícil. como você tá se sentindo?',
    contexto: 'tristeza é uma emoção válida e importante. às vezes precisamos de um espaço pra expressar o que sentimos sem precisar fingir que tá tudo bem.'
  },
  'dúvidas': {
    emoji: '🤔',
    nome: 'dúvidas',
    mensagemInicial: 'oi! dúvidas são parte da vida. me conta o que tá te deixando em dúvida.',
    contexto: 'ter dúvidas é normal e faz parte do processo de crescimento. aqui você pode explorar suas dúvidas sem pressão.'
  },
  'conquistas': {
    emoji: '😊',
    nome: 'conquistas',
    mensagemInicial: 'oi! que legal que você quer compartilhar uma conquista! me conta o que você alcançou.',
    contexto: 'compartilhar conquistas é importante! celebrar nossas vitórias, mesmo as pequenas, ajuda a manter a motivação e o bem-estar.'
  },
  'sono': {
    emoji: '😴',
    nome: 'sono',
    mensagemInicial: 'oi! problemas com sono podem ser muito desgastantes. como tá sendo pra você?',
    contexto: 'dificuldades para dormir ou descansar podem afetar muito nossa qualidade de vida. você pode falar sobre o que tá atrapalhando seu sono.'
  },
  'estudos': {
    emoji: '🎓',
    nome: 'estudos',
    mensagemInicial: 'oi! estudos podem gerar muita pressão né? me conta o que tá rolando.',
    contexto: 'a pressão dos estudos, provas, trabalhos e expectativas pode ser muito pesada. aqui você pode desabafar sobre isso.'
  },
  'família': {
    emoji: '👨‍👩‍👧‍👦',
    nome: 'família',
    mensagemInicial: 'oi! família pode ser complicada às vezes. o que você quer conversar?',
    contexto: 'relacionamentos familiares podem trazer alegria mas também conflitos e dificuldades. este é um espaço seguro pra você falar sobre isso.'
  },
  'motivação': {
    emoji: '💪',
    nome: 'motivação',
    mensagemInicial: 'oi! motivação pode ser difícil de manter às vezes. como você tá se sentindo?',
    contexto: 'perder a motivação é normal e acontece com todo mundo. aqui você pode explorar o que tá te desmotivando e o que te move.'
  },
  'raiva': {
    emoji: '😤',
    nome: 'raiva',
    mensagemInicial: 'oi. vejo que você tá sentindo raiva. me conta o que tá te deixando assim.',
    contexto: 'raiva é uma emoção válida e importante. expressar o que tá te deixando irritado pode ajudar a processar melhor esses sentimentos.'
  },
  'calma': {
    emoji: '😌',
    nome: 'calma',
    mensagemInicial: 'oi! que bom que você quer conversar sobre calma. como você tá se sentindo?',
    contexto: 'buscar calma e paz interior é importante. aqui você pode explorar o que te traz tranquilidade ou o que tá te tirando dela.'
  },
  'objetivos': {
    emoji: '🎯',
    nome: 'objetivos',
    mensagemInicial: 'oi! objetivos são importantes. me conta sobre os seus.',
    contexto: 'definir e alcançar objetivos pode ser desafiador. você pode falar sobre seus sonhos, metas e o que tá te ajudando ou atrapalhando.'
  },
  'amizade': {
    emoji: '🤝',
    nome: 'amizade',
    mensagemInicial: 'oi! amizades são importantes. o que você quer conversar sobre isso?',
    contexto: 'amizades podem trazer muita alegria mas também podem ter conflitos e dificuldades. aqui você pode falar sobre isso.'
  },
  'crescimento': {
    emoji: '🌱',
    nome: 'crescimento',
    mensagemInicial: 'oi! crescimento pessoal é uma jornada. me conta o que você tá vivendo.',
    contexto: 'crescer e se desenvolver como pessoa pode ser desafiador mas também muito recompensador. aqui você pode explorar sua jornada.'
  },
  'solidão': {
    emoji: '🌙',
    nome: 'solidão',
    mensagemInicial: 'oi. vejo que você quer conversar sobre solidão. como você tá se sentindo?',
    contexto: 'sentir-se sozinho pode ser muito difícil. aqui você pode desabafar sobre isso sem julgamentos.'
  },
  'medo': {
    emoji: '😨',
    nome: 'medo',
    mensagemInicial: 'oi. medo pode ser paralisante às vezes. me conta o que tá te assustando.',
    contexto: 'medo é uma emoção natural que nos protege, mas às vezes pode nos limitar. aqui você pode explorar seus medos.'
  },
  'estresse': {
    emoji: '😓',
    nome: 'estresse',
    mensagemInicial: 'oi! estresse pode ser muito pesado. o que tá te sobrecarregando?',
    contexto: 'viver sob pressão constante pode ser exaustivo. aqui você pode desabafar sobre o que tá te estressando.'
  },
  'autoestima': {
    emoji: '💎',
    nome: 'autoestima',
    mensagemInicial: 'oi! autoestima é algo que todos nós trabalhamos. como você tá se sentindo sobre si mesmo?',
    contexto: 'nossa relação com nós mesmos pode ser complexa. aqui você pode explorar questões de autoestima e autoconfiança.'
  },
  'perdas': {
    emoji: '💔',
    nome: 'perdas',
    mensagemInicial: 'oi. vejo que você quer conversar sobre perdas. como você tá lidando com isso?',
    contexto: 'lidar com perdas é um dos desafios mais difíceis da vida. aqui você pode expressar sua dor e processar seus sentimentos.'
  },
  'mudanças': {
    emoji: '🔄',
    nome: 'mudanças',
    mensagemInicial: 'oi! mudanças podem ser assustadoras mas também empolgantes. me conta o que tá mudando na sua vida.',
    contexto: 'mudanças trazem incerteza e novas possibilidades. aqui você pode explorar seus sentimentos sobre as transformações que está vivendo.'
  },
  'decisões': {
    emoji: '⚖️',
    nome: 'decisões',
    mensagemInicial: 'oi! decisões importantes podem ser difíceis. me conta sobre o que você precisa decidir.',
    contexto: 'tomar decisões pode gerar muita ansiedade e dúvida. aqui você pode explorar suas opções e sentimentos.'
  },
  'futuro': {
    emoji: '🔮',
    nome: 'futuro',
    mensagemInicial: 'oi! pensar no futuro pode gerar muitas emoções. o que tá te preocupando ou animando?',
    contexto: 'o futuro é incerto e isso pode trazer ansiedade ou esperança. aqui você pode explorar seus pensamentos sobre o que está por vir.'
  },
  'passado': {
    emoji: '📜',
    nome: 'passado',
    mensagemInicial: 'oi. às vezes o passado ainda nos afeta. me conta o que você tá pensando.',
    contexto: 'memórias e experiências passadas podem influenciar muito nosso presente. aqui você pode explorar isso.'
  },
  'presente': {
    emoji: '✨',
    nome: 'presente',
    mensagemInicial: 'oi! viver o presente pode ser desafiador. como você tá se sentindo agora?',
    contexto: 'estar presente e consciente do momento atual pode ser difícil. aqui você pode explorar sua relação com o agora.'
  },
  'gratidão': {
    emoji: '🙏',
    nome: 'gratidão',
    mensagemInicial: 'oi! que bom que você quer compartilhar gratidão. me conta pelo que você é grato.',
    contexto: 'praticar gratidão pode transformar nossa perspectiva. aqui você pode celebrar o que te faz bem.'
  },
  'esperança': {
    emoji: '🌟',
    nome: 'esperança',
    mensagemInicial: 'oi! esperança é poderosa. me conta o que te dá esperança.',
    contexto: 'manter a esperança em momentos difíceis pode ser desafiador. aqui você pode explorar o que te mantém esperançoso.'
  },
  'desânimo': {
    emoji: '😞',
    nome: 'desânimo',
    mensagemInicial: 'oi. vejo que você tá se sentindo desanimado. me conta o que tá acontecendo.',
    contexto: 'sentir-se desanimado é normal em alguns momentos. aqui você pode desabafar sobre isso.'
  },
  'confusão': {
    emoji: '🌀',
    nome: 'confusão',
    mensagemInicial: 'oi! confusão pode ser muito frustrante. me conta o que tá te deixando confuso.',
    contexto: 'sentir-se confuso sobre situações ou sentimentos é comum. aqui você pode explorar suas dúvidas.'
  },
  'alegria': {
    emoji: '😄',
    nome: 'alegria',
    mensagemInicial: 'oi! que bom que você quer compartilhar alegria! me conta o que te deixou feliz.',
    contexto: 'compartilhar momentos de alegria é importante! celebrar as coisas boas ajuda a manter o bem-estar.'
  },
  'orgulho': {
    emoji: '🏆',
    nome: 'orgulho',
    mensagemInicial: 'oi! que legal que você quer compartilhar algo que te deixa orgulhoso! me conta.',
    contexto: 'sentir orgulho de si mesmo ou de conquistas é importante. aqui você pode celebrar isso.'
  },
  'culpa': {
    emoji: '😔',
    nome: 'culpa',
    mensagemInicial: 'oi. vejo que você tá lidando com culpa. me conta o que tá te incomodando.',
    contexto: 'sentir culpa pode ser muito pesado. aqui você pode explorar esses sentimentos sem julgamentos.'
  },
  'vergonha': {
    emoji: '😳',
    nome: 'vergonha',
    mensagemInicial: 'oi. vergonha pode ser muito difícil de lidar. me conta o que tá te deixando assim.',
    contexto: 'sentir vergonha pode nos fazer querer nos esconder. aqui você pode falar sobre isso em um espaço seguro.'
  },
  'insegurança': {
    emoji: '😟',
    nome: 'insegurança',
    mensagemInicial: 'oi! insegurança pode aparecer em várias situações. me conta o que tá te deixando inseguro.',
    contexto: 'sentir-se inseguro é comum e pode afetar várias áreas da vida. aqui você pode explorar essas inseguranças.'
  },
  'comparação': {
    emoji: '🔍',
    nome: 'comparação',
    mensagemInicial: 'oi! comparação pode ser muito tóxica. me conta como você tá se sentindo.',
    contexto: 'comparar-se com outros pode gerar muita ansiedade e insatisfação. aqui você pode explorar isso.'
  },
  'perfeccionismo': {
    emoji: '💎',
    nome: 'perfeccionismo',
    mensagemInicial: 'oi! perfeccionismo pode ser muito exaustivo. me conta como isso tá te afetando.',
    contexto: 'buscar perfeição pode ser paralisante e gerar muita pressão. aqui você pode explorar sua relação com o perfeccionismo.'
  },
  'procrastinação': {
    emoji: '⏰',
    nome: 'procrastinação',
    mensagemInicial: 'oi! procrastinação pode ser frustrante. me conta o que você tá adiando.',
    contexto: 'adiar tarefas e decisões pode gerar ansiedade e culpa. aqui você pode explorar o que está te fazendo procrastinar.'
  },
  'rotina': {
    emoji: '📅',
    nome: 'rotina',
    mensagemInicial: 'oi! rotina pode ser confortável ou sufocante. como você tá se sentindo sobre a sua?',
    contexto: 'nossa rotina pode nos dar segurança ou nos fazer sentir presos. aqui você pode explorar sua relação com a rotina.'
  },
  'criatividade': {
    emoji: '🎨',
    nome: 'criatividade',
    mensagemInicial: 'oi! criatividade é algo que todos temos. me conta sobre seus projetos criativos.',
    contexto: 'expressar criatividade pode ser muito gratificante. aqui você pode falar sobre seus projetos e ideias.'
  },
  'sonhos': {
    emoji: '💭',
    nome: 'sonhos',
    mensagemInicial: 'oi! sonhos são importantes. me conta sobre os seus.',
    contexto: 'sonhar e ter aspirações é parte do que nos move. aqui você pode compartilhar seus sonhos e planos.'
  },
  'realidade': {
    emoji: '🌍',
    nome: 'realidade',
    mensagemInicial: 'oi! lidar com a realidade pode ser difícil. me conta o que tá te incomodando.',
    contexto: 'às vezes a realidade pode ser dura de aceitar. aqui você pode explorar seus sentimentos sobre isso.'
  },
  'expectativas': {
    emoji: '📊',
    nome: 'expectativas',
    mensagemInicial: 'oi! expectativas podem gerar muita pressão. me conta sobre as suas.',
    contexto: 'expectativas próprias ou de outros podem ser muito pesadas. aqui você pode explorar isso.'
  },
  'aceitação': {
    emoji: '🤗',
    nome: 'aceitação',
    mensagemInicial: 'oi! aceitação pode ser um processo difícil. me conta o que você tá tentando aceitar.',
    contexto: 'aceitar situações, sentimentos ou a nós mesmos pode ser desafiador. aqui você pode explorar esse processo.'
  },
  'mudança': {
    emoji: '🦋',
    nome: 'mudança',
    mensagemInicial: 'oi! mudanças pessoais são uma jornada. me conta sobre a sua.',
    contexto: 'mudar e se transformar pode ser assustador mas também libertador. aqui você pode explorar sua jornada de mudança.'
  },
  'autocuidado': {
    emoji: '🧘',
    nome: 'autocuidado',
    mensagemInicial: 'oi! autocuidado é fundamental. me conta como você tá cuidando de si mesmo.',
    contexto: 'cuidar de nós mesmos pode ser negligenciado. aqui você pode explorar formas de autocuidado e bem-estar.'
  },
  'limites': {
    emoji: '🚧',
    nome: 'limites',
    mensagemInicial: 'oi! estabelecer limites pode ser difícil. me conta sobre suas dificuldades.',
    contexto: 'saber colocar limites é importante para nosso bem-estar. aqui você pode explorar questões relacionadas a limites.'
  },
  'comunicação': {
    emoji: '💬',
    nome: 'comunicação',
    mensagemInicial: 'oi! comunicação pode ser complexa. me conta sobre suas dificuldades.',
    contexto: 'comunicar-se efetivamente nem sempre é fácil. aqui você pode explorar questões de comunicação.'
  },
  'intimidade': {
    emoji: '💕',
    nome: 'intimidade',
    mensagemInicial: 'oi! intimidade pode ser um tema delicado. me conta o que você quer conversar.',
    contexto: 'intimidade envolve vulnerabilidade e conexão. aqui você pode explorar questões relacionadas a intimidade.'
  },
  'confiança': {
    emoji: '🤝',
    nome: 'confiança',
    mensagemInicial: 'oi! confiança pode ser difícil de construir ou manter. me conta sobre isso.',
    contexto: 'confiar em outros ou em nós mesmos pode ser desafiador. aqui você pode explorar questões de confiança.'
  },
  'traição': {
    emoji: '💔',
    nome: 'traição',
    mensagemInicial: 'oi. vejo que você quer conversar sobre traição. como você tá lidando com isso?',
    contexto: 'lidar com traição pode ser muito doloroso. aqui você pode expressar sua dor e processar seus sentimentos.'
  },
  'perdão': {
    emoji: '🕊️',
    nome: 'perdão',
    mensagemInicial: 'oi! perdão pode ser um processo longo. me conta sobre sua jornada.',
    contexto: 'perdoar a nós mesmos ou outros pode ser muito difícil. aqui você pode explorar esse processo.'
  },
  'ciúmes': {
    emoji: '👁️',
    nome: 'ciúmes',
    mensagemInicial: 'oi. ciúmes pode ser difícil de lidar. me conta o que tá te incomodando.',
    contexto: 'sentir ciúmes pode gerar muita angústia. aqui você pode explorar esses sentimentos.'
  },
  'dependência': {
    emoji: '🔗',
    nome: 'dependência',
    mensagemInicial: 'oi. dependência pode ser um tema sensível. me conta o que você quer conversar.',
    contexto: 'lidar com dependências pode ser muito desafiador. aqui você pode explorar isso em um espaço seguro.'
  },
  'independência': {
    emoji: '🦅',
    nome: 'independência',
    mensagemInicial: 'oi! independência é algo que muitos buscam. me conta sobre sua jornada.',
    contexto: 'buscar independência pode ser libertador mas também assustador. aqui você pode explorar isso.'
  },
  'liberdade': {
    emoji: '🕊️',
    nome: 'liberdade',
    mensagemInicial: 'oi! liberdade pode significar coisas diferentes. me conta o que significa pra você.',
    contexto: 'buscar liberdade pessoal é uma jornada importante. aqui você pode explorar o que liberdade significa pra você.'
  },
  'responsabilidade': {
    emoji: '⚖️',
    nome: 'responsabilidade',
    mensagemInicial: 'oi! responsabilidades podem ser pesadas. me conta como você tá lidando.',
    contexto: 'lidar com responsabilidades pode gerar muita pressão. aqui você pode desabafar sobre isso.'
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
}

export default function ChatClient({ firstName, tema, voiceMode: initialVoiceMode = false }: ChatClientProps) {
  const temaInfo = tema ? temasMap[tema] : null
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { plan } = useUserPlan()
  const { showError, showSuccess, showInfo } = useToast()
  
  // Mensagem inicial baseada no tema ou padrão
  const getInitialMessage = () => {
    if (temaInfo) {
      return `${temaInfo.mensagemInicial}`
    }
    // Mensagem inicial mais casual e amigável
    const greetings = [
      `eae, ${firstName}! como você tá?`,
      `oi, ${firstName}! tudo bem?`,
      `hey, ${firstName}! o que tá rolando?`,
      `e aí, ${firstName}! como você tá hoje?`,
      `opa, ${firstName}! tudo certo?`,
    ]
    // Usar o nome para gerar um índice determinístico
    const hash = firstName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % greetings.length
    return greetings[index]
  }

  // No modo voz, não mostrar mensagem inicial
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  // Inicializar bestFriendMode do localStorage se disponível
  const [bestFriendMode, setBestFriendMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bestFriendMode')
      return saved === 'true'
    }
    return false
  })
  const [temporaryChat, setTemporaryChat] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('temporaryChat')
      return saved === 'true'
    }
    return false
  })
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Se for plano free, não permitir modo voz
  const [voiceMode, setVoiceMode] = useState(() => {
    // Inicializar baseado no plano, mas precisa verificar depois
    return initialVoiceMode
  })
  
  // Atualizar voiceMode quando o plano mudar
  useEffect(() => {
    if (plan === 'free') {
      setVoiceMode(false)
    } else if (plan === 'pro' && initialVoiceMode) {
      setVoiceMode(true)
    }
  }, [plan, initialVoiceMode])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showEmojiAnimation, setShowEmojiAnimation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Hook para Realtime Mini (substitui Google Cloud quando voiceMode está ativo)
  const realtimeSession = useRealtimeMini({
    firstName: firstName,
    tema: tema,
    bestFriendMode: bestFriendMode,
    onMessage: async (transcription: string) => {
      // Quando receber transcrição do Realtime Mini, adicionar como mensagem do usuário
      // O Realtime Mini já processa e responde em áudio, então não precisamos chamar /api/chat
      if (transcription && transcription.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcription,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        
        // Criar sessão na primeira mensagem se NÃO for chat temporário
        let currentSessionId = sessionId
        const userMessagesCount = messages.filter(m => m.role === 'user').length + 1
        
        if (!temporaryChat && !currentSessionId && userMessagesCount === 1) {
          try {
            const sessionResponse = await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstMessage: transcription,
                tema: tema || null,
                skipSummary: true
              })
            })
            
            if (sessionResponse.ok) {
              const { sessionId: newSessionId } = await sessionResponse.json()
              currentSessionId = newSessionId
              setSessionId(newSessionId)
            }
          } catch (err) {
            console.error('Erro ao criar sessão:', err)
          }
        }
        
        // Salvar no banco se tiver sessão
        if (!temporaryChat && currentSessionId) {
          const updatedMessages = [...messages, userMessage]
          fetch('/api/sessions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              sessionId: currentSessionId, 
              messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
            })
          }).catch(err => console.error('Erro ao salvar mensagem:', err))
        }
      }
    },
    onResponse: async (response: string) => {
      // Quando receber resposta da IA do Realtime Mini, adicionar como mensagem
      if (response && response.trim()) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Salvar no banco se tiver sessão
        if (!temporaryChat && sessionId) {
          const updatedMessages = [...messages, assistantMessage]
          fetch('/api/sessions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              sessionId: sessionId, 
              messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
            })
          }).catch(err => console.error('Erro ao salvar resposta:', err))
        }
      }
    },
    onError: (error) => {
      console.error('Erro na sessão Realtime:', error)
      showError('Erro na conexão de voz. Tente novamente.')
      setIsProcessingAudio(false)
      setIsRecording(false)
    },
    onSessionStart: () => {
      setIsRecording(true)
      setIsProcessingAudio(false)
    },
    onSessionEnd: () => {
      setIsRecording(false)
      setIsProcessingAudio(false)
    },
  })

  // Sincronizar modo com localStorage
  useEffect(() => {
    // Ler do localStorage e aplicar imediatamente
    const savedMode = localStorage.getItem('bestFriendMode')
    if (savedMode !== null) {
      const mode = savedMode === 'true'
      setBestFriendMode(mode)
      
      // Verificar se acabou de ser ativado no home
      const justActivated = localStorage.getItem('bestFriendModeJustActivated') === 'true'
      if (mode && justActivated) {
        setShowEmojiAnimation(true)
        setTimeout(() => {
          setShowEmojiAnimation(false)
          localStorage.removeItem('bestFriendModeJustActivated')
        }, 2000)
      }
    } else {
      // Se não houver valor salvo, usar false
      setBestFriendMode(false)
    }
    const savedTemporary = localStorage.getItem('temporaryChat')
    if (savedTemporary !== null) {
      setTemporaryChat(savedTemporary === 'true')
    }
    loadUserAvatar()
  }, [])

  // Carregar avatar do usuário
  const loadUserAvatar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Tentar pegar avatar do Google
        const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        if (avatarUrl) {
          setUserAvatar(avatarUrl)
        } else {
          // Criar inicial com as iniciais
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'U'
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
          setUserAvatar(`initials:${initials}`)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error)
    }
  }

  // Atualizar localStorage quando o modo mudar
  useEffect(() => {
    localStorage.setItem('bestFriendMode', bestFriendMode.toString())
  }, [bestFriendMode])

  useEffect(() => {
    localStorage.setItem('temporaryChat', temporaryChat.toString())
  }, [temporaryChat])

  // Inicializar mensagem inicial quando o chat carregar (apenas modo texto)
  useEffect(() => {
    if (!voiceMode && messages.length === 0 && !temporaryChat) {
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: getInitialMessage(),
        timestamp: new Date()
      }
      setMessages([initialMessage])
    }
  }, [voiceMode, firstName, tema]) // eslint-disable-line react-hooks/exhaustive-deps

  // Função para terminar conversa temporária
  const handleEndTemporaryChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: getInitialMessage(),
      timestamp: new Date()
    }])
    setSessionId(null)
    setInput('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Limpar recursos de áudio ao desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (realtimeSession.isActive) {
        realtimeSession.stopSession()
      }
    }
  }, [realtimeSession])

  // Interromper áudio quando usuário começar a falar
  const interruptAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlayingAudio(false)
    }
  }


  // Iniciar gravação (apenas para usuários Pro)
  const startRecording = async () => {
    if (plan !== 'pro') {
      return
    }

    try {
      // Usar Realtime Mini para usuários Pro
      interruptAudio()
      setIsProcessingAudio(true)
      await realtimeSession.startSession()
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      showError('Não foi possível acessar o microfone. Verifique as permissões.')
      setIsProcessingAudio(false)
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (realtimeSession.isActive) {
      realtimeSession.stopSession()
      setIsRecording(false)
    }
  }


  // Enviar mensagem de voz
  const sendVoiceMessage = async (transcription: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcription,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Criar sessão na primeira mensagem se NÃO for chat temporário
      let currentSessionId = sessionId
      const userMessagesCount = messages.filter(m => m.role === 'user').length + 1
      
      if (!temporaryChat && !currentSessionId && userMessagesCount === 1) {
        const sessionResponse = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstMessage: transcription,
            tema: tema || null,
            skipSummary: true
          })
        })
        
        if (sessionResponse.ok) {
          const { sessionId: newSessionId } = await sessionResponse.json()
          currentSessionId = newSessionId
          setSessionId(newSessionId)
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId: temporaryChat ? null : currentSessionId,
          bestFriendMode: bestFriendMode,
          firstName: firstName,
          tema: tema,
          temporaryChat: temporaryChat
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Erro ${response.status}: ${response.statusText}`
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorMessage)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isEmergency: data.isEmergency || false
      }

      const updatedMessages = [...messages, userMessage, assistantMessage]
      setMessages(updatedMessages)

      // Se estiver usando Realtime Mini, a resposta já vem em áudio via WebRTC
      // Não precisa chamar playAudioResponse
      if (!data.isEmergency && !(voiceMode && realtimeSession.isActive)) {
        await playAudioResponse(data.message)
      }

      // Atualizar resumo e tema (mesma lógica do handleSend)
      if (!temporaryChat && currentSessionId) {
        const userMessages = updatedMessages.filter(m => m.role === 'user')
        
        // Se tiver 6 ou mais mensagens do usuário, gerar/atualizar resumo
        if (userMessages.length >= 6) {
          // Verificar se precisa gerar resumo (primeira vez ou a cada 4 mensagens após a 6ª)
          const shouldUpdate = userMessages.length === 6 || (userMessages.length > 6 && (userMessages.length - 6) % 4 === 0)
          
          if (shouldUpdate) {
            let temaParaAtualizar = tema || null
            if (!temaParaAtualizar) {
              try {
                const themeResponse = await fetch('/api/chat/identify-theme', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) })
                })
                if (themeResponse.ok) {
                  const { tema: temaIdentificado } = await themeResponse.json()
                  temaParaAtualizar = temaIdentificado
                }
              } catch (err) {
                console.error('Erro ao identificar tema:', err)
              }
            }

            fetch('/api/sessions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: currentSessionId, messages: updatedMessages.map(m => ({ role: m.role, content: m.content })), tema: temaParaAtualizar })
            }).catch(err => console.error('Erro ao atualizar resumo:', err))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      showError('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Remover emojis do texto para síntese de voz
  const removeEmojis = (text: string): string => {
    // Regex para remover emojis (compatível com ES5+)
    // Remove emojis Unicode usando ranges compatíveis
    return text
      .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, '') // Surrogate pairs (emojis)
      .replace(/[\uD83D-\uD83E][\uDC00-\uDFFF]/g, '') // Mais emojis
      .replace(/[\u2600-\u26FF]/g, '') // Misc symbols
      .replace(/[\u2700-\u27BF]/g, '') // Dingbats
      .replace(/\s+/g, ' ') // Limpar espaços extras
      .trim()
  }

  // Reproduzir resposta em áudio
  const playAudioResponse = async (text: string) => {
    try {
      setIsPlayingAudio(true)

      // Remover emojis antes de enviar para síntese
      const textWithoutEmojis = removeEmojis(text)

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textWithoutEmojis })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const errorMessage = error.error || 'Erro ao gerar áudio'
        
        // Mensagem mais amigável para erro de configuração
        if (response.status === 503 || errorMessage.includes('não configurado')) {
          console.warn('Serviço de voz não configurado, resposta será apenas em texto')
          setIsPlayingAudio(false)
          return
        }
        
        throw new Error(errorMessage)
      }

      const { audio: audioBase64, format } = await response.json()

      // Criar URL do áudio
      const binaryString = atob(audioBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const audioBlob = new Blob([bytes], { type: `audio/${format}` })

      const audioUrl = URL.createObjectURL(audioBlob)

      // Reproduzir áudio
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      // Permitir interromper o áudio
      audioRef.current.src = audioUrl
      audioRef.current.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      // Permitir interromper quando usuário começar a falar
      audioRef.current.onpause = () => {
        setIsPlayingAudio(false)
      }

      audioRef.current.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error)
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      })
    } catch (error) {
      console.error('Erro ao reproduzir resposta em áudio:', error)
      setIsPlayingAudio(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || isSending) return
    
    setIsSending(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Criar sessão na primeira mensagem se NÃO for chat temporário
      let currentSessionId = sessionId
      const userMessagesCount = messages.filter(m => m.role === 'user').length + 1
      
      if (!temporaryChat && !currentSessionId && userMessagesCount === 1) {
        // Na primeira mensagem, criar sessão sem resumo
        const sessionResponse = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstMessage: messageContent,
            tema: tema || null,
            skipSummary: true // Sempre pular resumo na primeira mensagem
          })
        })
        
        if (sessionResponse.ok) {
          const { sessionId: newSessionId } = await sessionResponse.json()
          currentSessionId = newSessionId
          setSessionId(newSessionId)
          
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId: temporaryChat ? null : currentSessionId, // Não salvar se for temporário
          bestFriendMode: bestFriendMode,
          firstName: firstName,
          tema: tema,
          temporaryChat: temporaryChat
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isEmergency: data.isEmergency || false
      }

      const updatedMessages = [...messages, userMessage, assistantMessage]
      setMessages(updatedMessages)

      // Atualizar resumo e tema apenas se NÃO for chat temporário E tiver mais de 5 mensagens E não for emergência
      if (!temporaryChat && currentSessionId) {
        const userMessages = updatedMessages.filter(m => m.role === 'user')
        
        // Se tiver 6 ou mais mensagens do usuário, gerar/atualizar resumo
        // Gerar na 6ª mensagem e depois a cada 4 mensagens (10, 14, 18, etc)
        if (userMessages.length >= 6) {
          const shouldUpdate = userMessages.length === 6 || (userMessages.length > 6 && (userMessages.length - 6) % 4 === 0)
          
          if (shouldUpdate) {
            console.log(`Gerando resumo para ${userMessages.length} mensagens do usuário`)
            
            // Identificar tema se ainda não tiver
            let temaParaAtualizar = tema || null
            if (!temaParaAtualizar) {
              try {
                const themeResponse = await fetch('/api/chat/identify-theme', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messages: updatedMessages.map(m => ({
                      role: m.role,
                      content: m.content
                    }))
                  })
                })
                
                if (themeResponse.ok) {
                  const { tema: temaDetectado } = await themeResponse.json()
                  temaParaAtualizar = temaDetectado
                }
              } catch (error) {
                console.error('Erro ao identificar tema:', error)
              }
            }

            fetch('/api/sessions', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId: currentSessionId,
                messages: updatedMessages.map(m => ({
                  role: m.role,
                  content: m.content
                })),
                tema: temaParaAtualizar
              })
            })
            .then(response => {
              if (!response.ok) {
                console.error('Erro ao atualizar resumo:', response.status, response.statusText)
              } else {
                console.log('Resumo atualizado com sucesso')
              }
            })
            .catch(err => console.error('Erro ao atualizar resumo:', err))
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Log detalhado do erro para debug
      console.error('Detalhes do erro:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        response: error?.response
      })
      
      // Mostrar mensagem de erro mais específica
      let errorMessageText = 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'
      
      if (error?.message) {
        // Mensagens de erro mais específicas
        if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('Muitas requisições')) {
          errorMessageText = 'Você está enviando mensagens muito rápido. Aguarde um momento e tente novamente.'
        } else if (error.message.includes('401') || error.message.includes('403') || error.message.includes('autenticação')) {
          errorMessageText = 'Erro de autenticação. Por favor, faça login novamente.'
        } else if (error.message.includes('configuração') || error.message.includes('API')) {
          errorMessageText = 'Erro de configuração do sistema. Por favor, tente novamente mais tarde.'
        } else {
          errorMessageText = error.message
        }
      }
      
      showError(error?.message || 'Erro ao enviar mensagem. Tente novamente.')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsSending(false)
      // Focar no campo de texto após a resposta da IA
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Banner Experimentar Pro */}
      <ProBanner />
      
      {/* Logo desabafo no topo - Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-5 sm:top-6 left-4 sm:left-6 z-10"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-lg sm:text-xl font-light text-gray-800 dark:text-gray-200 tracking-tight hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
        >
          desabafo
        </button>
      </motion.div>

      {/* Sidebar esquerda com ícones */}
      <Sidebar />

      {/* Tema no topo (se houver) - Minimalista */}
      {temaInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-pink-50 dark:bg-pink-900/20 rounded-full border border-pink-200 dark:border-pink-800 shadow-sm">
            <span className="text-base">{temaInfo.emoji}</span>
            <span className="text-xs sm:text-sm font-light text-pink-800 dark:text-pink-300">{temaInfo.nome}</span>
          </div>
        </motion.div>
      )}

      {/* Switches no canto superior direito - Ocultar no modo voz */}
      {!voiceMode && (
        <div className="absolute top-20 sm:top-24 right-4 sm:right-6 flex flex-col items-end gap-2.5 z-10">
          {/* Modo Melhor Amigo */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-light">melhor amigo</span>
            <button
              onClick={() => {
                const newMode = !bestFriendMode
                setBestFriendMode(newMode)
                if (newMode) {
                  setShowEmojiAnimation(true)
                  setTimeout(() => {
                    setShowEmojiAnimation(false)
                  }, 2000)
                }
              }}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                bestFriendMode ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  bestFriendMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          {/* Chat Temporário */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-light">temporário</span>
            <button
              onClick={() => {
                const newTemporary = !temporaryChat
                setTemporaryChat(newTemporary)
                if (newTemporary) {
                  // Se ativou temporário, limpar sessão atual
                  setSessionId(null)
                }
              }}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                temporaryChat ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  temporaryChat ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Botão para terminar conversa temporária (só aparece se estiver ativo) */}
          {temporaryChat && messages.length > 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleEndTemporaryChat}
              className="mt-1 px-3.5 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full font-light hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer shadow-sm"
              type="button"
            >
              terminar conversa
            </motion.button>
          )}
        </div>
      )}

      {/* Chat Container - Estilo Calm */}
      <div className="flex items-end justify-center min-h-screen px-4 sm:px-6 pb-24 sm:pb-32 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50/50 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="w-full max-w-2xl">
          
          {/* Messages - Estilo Calm com mais espaçamento */}
          {/* Ocultar mensagens no modo voz */}
          {!voiceMode && (
            <div className="space-y-6 mb-10">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar - Cores mais escuras */}
                  {message.role === 'assistant' ? (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-md shadow-pink-200/30 dark:shadow-pink-900/20" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center shadow-sm">
                      {userAvatar && userAvatar.startsWith('initials:') ? (
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {userAvatar.replace('initials:', '')}
                        </span>
                      ) : userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {firstName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Mensagem */}
                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.isEmergency ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 shadow-lg"
                      >
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🚨</span>
                            <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
                              você não está sozinho
                            </h3>
                          </div>
                          <p className="text-sm sm:text-base font-light leading-relaxed text-red-800 dark:text-red-200 break-words mb-4">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Botões de emergência */}
                        <div className="space-y-3">
                          <a
                            href="tel:188"
                            className="block w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-center transition-all shadow-md hover:shadow-lg"
                          >
                            📞 ligar para cvv (188)
                            <span className="block text-xs font-light mt-1 opacity-90">
                              centro de valorização da vida - 24 horas, gratuito
                            </span>
                          </a>
                          <a
                            href="tel:192"
                            className="block w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium text-center transition-all shadow-md hover:shadow-lg"
                          >
                            🚑 ligar para samu (192)
                            <span className="block text-xs font-light mt-1 opacity-90">
                              emergências médicas
                            </span>
                          </a>
                          <div className="pt-2 border-t border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-700 dark:text-red-300 font-light text-center">
                              sua vida importa. por favor, procure ajuda profissional.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-[15px] sm:text-base font-light leading-[1.7] text-slate-700 dark:text-slate-200 break-words tracking-wide">
                        {message.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bola pulsante durante loading - no lugar do emoji */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: [0.6, 1, 0.6],
                      boxShadow: [
                        '0 0 0 0 rgba(236, 72, 153, 0.4)',
                        '0 0 0 8px rgba(236, 72, 153, 0)',
                        '0 0 0 0 rgba(236, 72, 153, 0)'
                      ]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-md shadow-pink-200/30 dark:shadow-pink-900/20"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                  />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Input Area - Minimalista */}
          <div className="relative">
            {voiceMode && plan === 'pro' ? (
              /* Modo Voz - Estilo Calm */
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                {/* Título centralizado no topo */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  <h2 className="text-2xl sm:text-3xl font-light text-slate-700 dark:text-slate-200 tracking-wide">
                    estou ouvindo, é só desabafar
                  </h2>
                </motion.div>

                {/* Aviso de privacidade */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔒</span>
                      <div className="flex-1">
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-light leading-relaxed">
                          <strong className="font-medium">totalmente seguro:</strong> suas conversas por voz não ficam salvas nos chats nem nos insights. tudo é privado e temporário.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Botão grande e centralizado com animação pulsante suave - Estilo Calm */}
                <div className="relative">
                  {/* Círculos pulsantes de fundo (efeito Calm mais suave) */}
                  {(isRecording || realtimeSession.isActive) && (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/50 to-purple-200/50 dark:from-pink-900/30 dark:to-purple-900/30"
                        style={{ width: '140px', height: '140px', top: '-20px', left: '-20px' }}
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.2, 0, 0.2],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/40 to-purple-200/40 dark:from-pink-900/20 dark:to-purple-900/20"
                        style={{ width: '140px', height: '140px', top: '-20px', left: '-20px' }}
                      />
                    </>
                  )}
                  
                  {/* Botão principal - Estilo Calm mais suave */}
                  <motion.button
                    whileHover={!(isRecording || realtimeSession.isActive || realtimeSession.isConnecting) ? { scale: 1.05 } : {}}
                    whileTap={!(isRecording || realtimeSession.isActive || realtimeSession.isConnecting) ? { scale: 0.95 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isRecording || realtimeSession.isActive) {
                        // Encerrar sessão diretamente
                        stopRecording()
                      } else {
                        startRecording()
                      }
                    }}
                    disabled={realtimeSession.isConnecting}
                    className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      (isRecording || realtimeSession.isActive)
                        ? 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30'
                        : 'bg-gradient-to-br from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 shadow-md shadow-pink-100/50 dark:shadow-pink-900/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {realtimeSession.isConnecting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-white/80 border-t-transparent rounded-full"
                      />
                    ) : (isRecording || realtimeSession.isActive) ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-8 h-8 bg-white rounded-sm"
                      />
                    ) : (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    )}
                  </motion.button>
                </div>

                {/* Status suave - Estilo Calm */}
                <div className="text-center space-y-3">
                  {realtimeSession.isConnecting && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[15px] text-slate-500 dark:text-slate-400 font-light tracking-wide"
                    >
                      conectando...
                    </motion.p>
                  )}
                  {(isRecording || realtimeSession.isActive) && !realtimeSession.isConnecting && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[15px] text-slate-600 dark:text-slate-300 font-light tracking-wide"
                    >
                      estou ouvindo...
                    </motion.p>
                  )}
                  {!isRecording && !realtimeSession.isActive && !realtimeSession.isConnecting && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[15px] text-slate-400 dark:text-slate-500 font-light tracking-wide"
                    >
                      toque para começar
                    </motion.p>
                  )}
                </div>

                {/* Botão discreto para alternar para modo texto */}
                <motion.button
                  onClick={() => setVoiceMode(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer font-light mt-4"
                >
                  ou escreva aqui
                </motion.button>
              </div>
            ) : (
              /* Modo Texto - Estilo Calm */
              <>
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-300/60 dark:hover:border-rose-700/60 transition-all shadow-sm">
                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="escreva sua mensagem..."
                    disabled={isLoading || isSending}
                    className="w-full bg-transparent rounded-full py-4 sm:py-5 px-6 sm:px-7 pr-16 sm:pr-20 text-[15px] sm:text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  {/* Botão enviar - Estilo Calm */}
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || isSending}
                    whileHover={!isLoading && !isSending && input.trim() ? { scale: 1.08 } : {}}
                    whileTap={!isLoading && !isSending && input.trim() ? { scale: 0.92 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </motion.button>
                </div>

                {/* Botão para alternar para modo voz (apenas Pro) */}
                {plan === 'pro' && (
                  <div className="flex justify-center mt-2.5">
                    <button
                      onClick={() => setVoiceMode(true)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer font-light flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                      ou fale aqui
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animação de emoji quando ativa modo melhor amigo */}
      <AnimatePresence>
        {showEmojiAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              y: [0, -100, -150, -200],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
          >
            <div className="text-8xl">💜</div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}

