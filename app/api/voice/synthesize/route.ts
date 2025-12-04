import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { getGoogleCloudCredentials } from '@/lib/googleCloudCredentials'

// Verificar se as credenciais estão configuradas
const getTTSClient = () => {
  const credentials = getGoogleCloudCredentials()
  
  if (!credentials) {
    return null
  }

  try {
    return new TextToSpeechClient({
      credentials: credentials,
      projectId: credentials.project_id
    })
  } catch (error) {
    console.error('Erro ao inicializar TextToSpeechClient:', error)
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

    // Verificar se as credenciais do Google Cloud estão configuradas
    const ttsClient = getTTSClient()
    if (!ttsClient) {
      return NextResponse.json(
        { error: 'Serviço de voz não configurado. Por favor, configure as credenciais do Google Cloud.' },
        { status: 503 }
      )
    }

    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Texto não fornecido' }, { status: 400 })
    }

    // Limitar tamanho do texto para controle de custos (máximo 5000 caracteres)
    const textToSynthesize = text.length > 5000 ? text.substring(0, 5000) : text

    // Configuração para síntese de voz em português brasileiro
    // Usando voz feminina acolhedora (pt-BR-Standard-A ou pt-BR-Neural2-C)
    const request_config = {
      input: { text: textToSynthesize },
      voice: {
        languageCode: 'pt-BR',
        name: 'pt-BR-Neural2-C', // Voz feminina neural, mais natural e acolhedora
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0, // Velocidade normal
        pitch: 0.0, // Tom normal
        volumeGainDb: 0.0, // Volume normal
      },
    }

    const [response] = await ttsClient.synthesizeSpeech(request_config)

    if (!response.audioContent) {
      return NextResponse.json(
        { error: 'Erro ao gerar áudio' },
        { status: 500 }
      )
    }

    // Retornar o áudio como base64
    const audioBase64 = Buffer.from(response.audioContent).toString('base64')

    return NextResponse.json({ 
      audio: audioBase64,
      format: 'mp3'
    })
  } catch (error: any) {
    console.error('Erro ao sintetizar voz:', error)
    
    // Verificar se é erro de credenciais
    if (error.message?.includes('Could not load the default credentials') || 
        error.message?.includes('credentials')) {
      return NextResponse.json(
        { error: 'Serviço de voz não configurado. Por favor, configure as credenciais do Google Cloud.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao gerar resposta em áudio. Tente novamente.' },
      { status: 500 }
    )
  }
}

