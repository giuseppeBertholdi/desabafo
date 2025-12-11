import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'

export const metadata: Metadata = {
  metadataBase: new URL('https://desabafo.io'),
  title: {
    default: 'desabafo.io - sua IA terapeuta',
    template: '%s | desabafo.io'
  },
  description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar. terapia online, suporte emocional, saúde mental, ansiedade, depressão.',
  keywords: [
    'IA terapeuta',
    'terapia online',
    'suporte emocional',
    'saúde mental',
    'ansiedade',
    'depressão',
    'desabafo',
    'chat terapeuta',
    'psicologia online',
    'bem-estar mental',
    'autocuidado',
    'terapia virtual',
    'IA conversacional',
    'assistente emocional'
  ],
  authors: [{ name: 'desabafo.io' }],
  creator: 'desabafo.io',
  publisher: 'desabafo.io',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://desabafo.io',
    siteName: 'desabafo.io',
    title: 'desabafo.io - sua IA terapeuta',
    description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'desabafo.io - sua IA terapeuta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'desabafo.io - sua IA terapeuta',
    description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
    images: ['/og-image.png'],
    creator: '@desabafoio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
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
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

