import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'
import AccessibilityControls from '@/components/AccessibilityControls'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'

export const metadata: Metadata = {
  title: 'desabafo.io - sua IA terapeuta',
  description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L3K513VQ0K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L3K513VQ0K');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <KeyboardShortcuts />
            {children}
            <AccessibilityControls />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

