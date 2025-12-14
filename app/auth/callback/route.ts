import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Erro ao trocar código por sessão:', exchangeError)
        return NextResponse.redirect(new URL('/login?error=auth_error', request.url))
      }
      
      // Aguardar um pouco para garantir que os cookies foram definidos
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verificar se a sessão foi criada
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Erro ao buscar sessão após exchange:', sessionError)
        return NextResponse.redirect(new URL('/login?error=session_error', request.url))
      }
      
      if (!session) {
        console.error('Sessão não foi criada após exchange')
        return NextResponse.redirect(new URL('/login?error=no_session', request.url))
      }

      // Processar referência se houver código na URL
      const referralCode = requestUrl.searchParams.get('ref')
      console.log('🔍 Referral code no callback:', referralCode, 'User ID:', session.user.id)
      
      if (referralCode && session.user) {
        try {
          // Usar service role para processar referência (bypass RLS)
          const { createClient } = await import('@supabase/supabase-js')
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          )

          // Verificar se já foi referido por alguém (antes de processar)
          const { data: alreadyReferred } = await supabaseAdmin
            .from('referrals')
            .select('id')
            .eq('referred_id', session.user.id)
            .maybeSingle()

          if (alreadyReferred) {
            console.log('⚠️ Usuário já foi referido por outro código')
          } else {
            // Buscar referência pelo código
            const { data: referral, error: referralError } = await supabaseAdmin
              .from('referrals')
              .select('referrer_id, referred_id, completed_at')
              .eq('referral_code', referralCode.toUpperCase())
              .maybeSingle()

            if (referralError) {
              console.error('❌ Erro ao buscar referência:', referralError)
            } else if (referral) {
              // Verificar se o usuário não está tentando se referir a si mesmo
              if (referral.referrer_id === session.user.id) {
                console.log('⚠️ Usuário tentou usar seu próprio código de referência')
              } else if (referral.completed_at) {
                console.log('⚠️ Código de referência já foi usado')
              } else {
                // Atualizar referência usando service role
                const { error: updateError } = await supabaseAdmin
                  .from('referrals')
                  .update({
                    referred_id: session.user.id,
                    completed_at: new Date().toISOString()
                  })
                  .eq('referral_code', referralCode.toUpperCase())

                if (updateError) {
                  console.error('❌ Erro ao atualizar referência:', updateError)
                } else {
                  console.log('✅ Referência processada com sucesso! Usuário:', session.user.id, 'Referrer:', referral.referrer_id)
                }
              }
            } else {
              console.log('⚠️ Código de referência não encontrado:', referralCode)
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar referência:', error)
          // Não bloquear o login se houver erro na referência
        }
      }

      // Tentar verificar onboarding (com fallback seguro)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .maybeSingle()

        // Se tabela não existir ou der erro, ir para onboarding
        if (profileError && profileError.code === 'PGRST116') {
          console.warn('Tabela user_profiles não existe, indo para onboarding')
          const redirectUrl = new URL('/onboarding', request.url)
          redirectUrl.searchParams.set('new', 'true')
          return NextResponse.redirect(redirectUrl)
        }

        // Se não completou onboarding, redirecionar
        if (!profile || !profile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // Onboarding completo, ir para home
        // Usar replace para evitar histórico de navegação
        const homeUrl = new URL('/home', request.url)
        const response = NextResponse.redirect(homeUrl)
        // Garantir que os cookies sejam enviados
        response.headers.set('Cache-Control', 'no-store, must-revalidate')
        return response
        
      } catch (error) {
        console.error('Erro ao verificar perfil:', error)
        // Em caso de erro, ir para onboarding (seguro)
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      
    } catch (error) {
      console.error('Erro no callback de autenticação:', error)
      return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
    }
  }

  // Se não tem código, redirecionar para login
  return NextResponse.redirect(new URL('/login', request.url))
}
