// app/layout.tsx
import type { Metadata } from 'next'
import { Outfit, Rubik_Distressed } from 'next/font/google'
import './globals.css'
import Footer from './components/molecules/Footer'
import ChatboxWidget from './components/ui/ChatboxWidget'
// import Header from './components/molecules/Header'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { DeviseProvider } from './context/DeviseContext';
import { FavorisProvider } from './context/FavorisContext';
import { HeaderThemeProvider } from './context/HeaderThemeContext';

// Configuration correcte de la police Outfit
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit', // Variable CSS pour utiliser la police
  display: 'swap',
})

const rubikDistressed = Rubik_Distressed({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik-distressed',
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
    <html lang="fr" className={`${outfit.variable} ${rubikDistressed.variable}`}>
      <body className="font-outfit">
        <NextIntlClientProvider messages={messages}>
          <DeviseProvider>
            <FavorisProvider>
              <HeaderThemeProvider>
                {/* <Header /> */}
                {children}
                <Footer/>
                <ChatboxWidget />
              </HeaderThemeProvider>
            </FavorisProvider>
          </DeviseProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}