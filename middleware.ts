import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // protege home, chat, history, insights, pricing, account e onboarding
  if ((req.nextUrl.pathname.startsWith('/home') || 
       req.nextUrl.pathname.startsWith('/chat') ||
       req.nextUrl.pathname.startsWith('/history') ||
       req.nextUrl.pathname.startsWith('/insights') ||
       req.nextUrl.pathname.startsWith('/pricing') ||
       req.nextUrl.pathname.startsWith('/account') ||
       req.nextUrl.pathname.startsWith('/onboarding')) && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
    matcher: ['/home/:path*', '/home', '/chat/:path*', '/chat', '/history/:path*', '/history', '/insights/:path*', '/insights', '/pricing/:path*', '/pricing', '/account/:path*', '/account', '/onboarding/:path*', '/onboarding'],
  }
  