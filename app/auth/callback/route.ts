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
      
      // Verificar se a sessão foi criada
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('Sessão não foi criada após exchange')
        return NextResponse.redirect(new URL('/login?error=no_session', request.url))
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
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // Se não completou onboarding, redirecionar
        if (!profile || !profile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // Onboarding completo, ir para home
        return NextResponse.redirect(new URL('/home', request.url))
        
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
