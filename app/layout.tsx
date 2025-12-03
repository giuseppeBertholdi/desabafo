import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'desabafo - sua IA terapeuta',
  description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

