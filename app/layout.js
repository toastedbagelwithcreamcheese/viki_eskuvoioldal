// app/layout.js
import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Viki Esküvői Oldal',
  description: 'Esküvői meghívó és admin felület',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
