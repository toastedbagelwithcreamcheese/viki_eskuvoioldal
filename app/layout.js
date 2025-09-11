// app/layout.js
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

// Betűtípusok beállítása a design system alapján
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

// Metadatok, kiegészítve az ikonokkal
export const metadata = {
  title: 'Viktória & Tomi Esküvője',
  description: 'Szeretettel meghívunk az esküvőnkre!',
  icons: {
    icon: '/favicon.ico', // Alapértelmezett favicon
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: '/favicon-32x32.png',
        }
    ]
  },
}

export default function RootLayout({ children }) {
  return (
    // A class nevek most már a betűtípus változókat használják
    <html lang="hu" className={`${playfair.variable} ${inter.variable}`}>
      {/* A <head> tartalma már a metadata objektumból jön, így itt üresen hagyható */}
      <head />
      <body>
        {/* A body-ról levesszük a felesleges class-okat, mert a globals.css kezeli */}
        <main>{children}</main>
      </body>
    </html>
  )
}