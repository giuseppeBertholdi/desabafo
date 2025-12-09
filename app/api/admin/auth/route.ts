import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Credenciais do admin (armazenar em variável de ambiente em produção)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Desabafo2024!Secure#'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verificar credenciais
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Criar token de sessão simples (em produção, use JWT ou similar)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      // Definir cookie de sessão (válido por 24 horas)
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: 'Credenciais inválidas' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Erro na autenticação do admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar autenticação' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Verificar se há sessão válida
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (session) {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}

export async function DELETE() {
  // Logout - remover cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}

