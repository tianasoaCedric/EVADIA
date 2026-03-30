// app/layout.tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Footer from './components/molecules/Footer'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Configuration correcte de la police Outfit
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit', // Variable CSS pour utiliser la police
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Récupérer les messages pour la locale courante
  const messages = await getMessages();
  
  return (
    <html lang="fr" className={outfit.variable}>
      <body className="font-outfit">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Footer/> 
        </NextIntlClientProvider>
      </body>
    </html>
  )
}