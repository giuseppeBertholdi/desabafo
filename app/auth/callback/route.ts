import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Verificar se completou o onboarding
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .single()

        // Se não completou, redirecionar para onboarding
        if (!profile || !profile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      } catch (error) {
        // Se a tabela não existir ou houver erro, redirecionar para onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Após completar onboarding, redirecionar para pricing
      // Verificar se já tem assinatura ativa
      try {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single()

        // Se já tem assinatura, ir direto para home
        if (subscription) {
          return NextResponse.redirect(new URL('/home', request.url))
        }
      } catch (error) {
        // Se não tem assinatura, continuar para pricing
      }

      // Redirecionar para pricing para escolher plano
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // Redireciona para o home
  return NextResponse.redirect(new URL('/home', request.url))
}
