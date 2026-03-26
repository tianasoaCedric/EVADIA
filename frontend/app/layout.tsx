// app/layout.tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Footer from './components/molecules/Footer'

// Configuration correcte de la police Outfit
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit', // Variable CSS pour utiliser la police
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Evadia',
  description: 'Application Evadia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={outfit.variable}>
      <body className="font-outfit">
        {children}
        <Footer/>
      </body>
    </html>
  )
}