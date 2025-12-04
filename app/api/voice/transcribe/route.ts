import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SpeechClient } from '@google-cloud/speech'
import { getGoogleCloudCredentials } from '@/lib/googleCloudCredentials'
import { requireProPlan, unauthorizedResponse } from '@/lib/planAuthorization'

// Verificar se as credenciais estão configuradas
const getSpeechClient = () => {
  const credentials = getGoogleCloudCredentials()
  
  if (!credentials) {
    return null
  }

  try {
    return new SpeechClient({
      credentials: credentials,
      projectId: credentials.project_id
    })
  } catch (error) {
    console.error('Erro ao inicializar SpeechClient:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // SEGURANÇA: Verificar se usuário tem plano PRO (voz é feature premium)
    const planCheck = await requireProPlan(session.user.id, 'Chat por voz')
    if (!planCheck.isAuthorized) {
      return unauthorizedResponse(planCheck.message || 'Plano PRO necessário', planCheck.plan)
    }

    // Verificar se as credenciais do Google Cloud estão configuradas
    const speechClient = getSpeechClient()
    if (!speechClient) {
      return NextResponse.json(
        { error: 'Serviço de voz não configurado. Por favor, configure as credenciais do Google Cloud.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Áudio não fornecido' }, { status: 400 })
    }

    // Converter File para Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBytes = Buffer.from(arrayBuffer)

    // Detectar formato do áudio
    const mimeType = audioFile.type || 'audio/webm'
    let encoding: 'WEBM_OPUS' | 'LINEAR16' | 'OGG_OPUS' = 'WEBM_OPUS'
    let sampleRateHertz = 48000

    if (mimeType.includes('webm') || mimeType.includes('opus')) {
      encoding = 'WEBM_OPUS'
      sampleRateHertz = 48000
    } else if (mimeType.includes('wav') || mimeType.includes('pcm')) {
      encoding = 'LINEAR16'
      sampleRateHertz = 16000
    } else if (mimeType.includes('ogg')) {
      encoding = 'OGG_OPUS'
      sampleRateHertz = 48000
    }

    // Configuração para reconhecimento de fala em português brasileiro
    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: 'pt-BR',
      alternativeLanguageCodes: ['pt-PT'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
    }

    const audio = {
      content: audioBytes.toString('base64'),
    }

    const request_config = {
      config,
      audio,
    }

    // Fazer a requisição para o Speech-to-Text
    const [response] = await speechClient.recognize(request_config)

    if (!response.results || response.results.length === 0) {
      return NextResponse.json({ 
        error: 'Não foi possível transcrever o áudio. Tente falar mais claramente.' 
      }, { status: 400 })
    }

    const transcription = response.results
      .map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ')

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Não foi possível entender o áudio. Tente falar novamente.' 
      }, { status: 400 })
    }

    return NextResponse.json({ transcription: transcription.trim() })
  } catch (error: any) {
    console.error('Erro ao transcrever áudio:', error)
    
    // Erros mais amigáveis
    if (error.message?.includes('Invalid audio')) {
      return NextResponse.json(
        { error: 'Formato de áudio não suportado. Tente gravar novamente.' },
        { status: 400 }
      )
    }

    // Verificar se é erro de credenciais
    if (error.message?.includes('Could not load the default credentials') || 
        error.message?.includes('credentials')) {
      return NextResponse.json(
        { error: 'Serviço de voz não configurado. Por favor, configure as credenciais do Google Cloud.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao processar o áudio. Tente novamente.' },
      { status: 500 }
    )
  }
}

