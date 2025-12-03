import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '6b7a619b335547f2b2d0c8729662fa4a'
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '767d5e08ded142c2b44246beda3133cd'
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/callback'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/account?error=missing_params', request.url))
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar state
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('spotify_state')
      .eq('user_id', session.user.id)
      .single()

    if (!profile || profile.spotify_state !== state) {
      return NextResponse.redirect(new URL('/account?error=invalid_state', request.url))
    }

    // Trocar code por access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Erro ao obter token:', errorData)
      return NextResponse.redirect(new URL('/account?error=token_error', request.url))
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Salvar tokens no banco
    await supabase
      .from('user_profiles')
      .update({
        spotify_access_token: access_token,
        spotify_refresh_token: refresh_token,
        spotify_token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        spotify_state: null, // Limpar state
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)

    return NextResponse.redirect(new URL('/account?spotify=connected', request.url))
  } catch (error) {
    console.error('Erro no callback do Spotify:', error)
    return NextResponse.redirect(new URL('/account?error=callback_error', request.url))
  }
}

