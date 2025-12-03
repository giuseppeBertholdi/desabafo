import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '6b7a619b335547f2b2d0c8729662fa4a'
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '767d5e08ded142c2b44246beda3133cd'

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw new Error('Erro ao renovar token')
  }

  return response.json()
}

async function getValidAccessToken(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('user_id', userId)
    .single()

  if (!profile?.spotify_access_token) {
    throw new Error('Spotify não conectado')
  }

  // Verificar se o token expirou
  const expiresAt = profile.spotify_token_expires_at ? new Date(profile.spotify_token_expires_at) : null
  const now = new Date()
  
  if (expiresAt && now >= expiresAt && profile.spotify_refresh_token) {
    // Renovar token
    const tokenData = await refreshAccessToken(profile.spotify_refresh_token)
    
    const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    await supabase
      .from('user_profiles')
      .update({
        spotify_access_token: tokenData.access_token,
        spotify_token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return tokenData.access_token
  }

  return profile.spotify_access_token
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const accessToken = await getValidAccessToken(supabase, session.user.id)

    // Buscar música atual
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) {
      // Nenhuma música tocando
      return NextResponse.json({ isPlaying: false })
    }

    if (!response.ok) {
      throw new Error('Erro ao buscar música atual')
    }

    const data = await response.json()
    
    return NextResponse.json({
      isPlaying: true,
      track: {
        name: data.item?.name,
        artist: data.item?.artists?.map((a: any) => a.name).join(', '),
        album: data.item?.album?.name,
        image: data.item?.album?.images?.[0]?.url,
        uri: data.item?.uri,
        duration: data.item?.duration_ms,
        progress: data.progress_ms
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar música atual:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar música atual' },
      { status: 500 }
    )
  }
}

