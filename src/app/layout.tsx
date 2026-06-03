import type { Metadata } from 'next'
import { Bebas_Neue, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ["latin"],
  variable: '--font-bebas'
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair'
});

const cronicleDemo = localFont({
  src: '../../public/fonts/CronicleDemo.ttf',
  variable: '--font-metal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GONZ TATTOO | Tatuajes old school',
  description: 'Tatuajes old school, diseños personalizados y tinta con carácter. Escribí para coordinar tu consulta.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${playfairDisplay.variable} ${cronicleDemo.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
