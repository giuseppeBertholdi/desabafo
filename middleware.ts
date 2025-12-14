import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Não verificar autenticação para rotas públicas
  const publicPaths = ['/login', '/auth/callback', '/', '/sitemap.xml', '/robots.txt', '/manifest.json', '/privacidade', '/termos']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname) || req.nextUrl.pathname.startsWith('/invite/')
  if (isPublicPath) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Se houver erro ao buscar sessão, permitir passar (evitar loops)
    if (error) {
      console.warn('Erro ao buscar sessão no middleware:', error.message)
      return res
    }

    // protege home, chat, history, insights, pricing, account e onboarding
    const protectedPaths = ['/home', '/chat', '/history', '/insights', '/pricing', '/account', '/onboarding']
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !session) {
      // Redirecionar para login apenas se não estiver já na página de login
      if (req.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  } catch (error) {
    // Em caso de erro, permitir passar para evitar loops
    console.error('Erro no middleware:', error)
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/home/:path*',
    '/home',
    '/chat/:path*',
    '/chat',
    '/history/:path*',
    '/history',
    '/insights/:path*',
    '/insights',
    '/pricing/:path*',
    '/pricing',
    '/account/:path*',
    '/account',
    '/onboarding/:path*',
    '/onboarding',
    '/login',
    '/auth/callback',
  ],
}
  