import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'desabafo.io - sua IA terapeuta',
  description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' }
    ],
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
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

