import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Playfair_Display, Inter } from 'next/font/google';
import '../globals.css';

// 🔹 Statikus importok – így a JSON-ok beépülnek a buildbe
import hu from '../../messages/hu.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Viktória & Tomi Esküvője',
  description: 'Szeretettel meghívunk az esküvőnkre!',
};

export default async function RootLayout({ children, params }) {
  const locale = params?.locale || 'hu';

  if (!['hu', 'en', 'de'].includes(locale)) notFound();

  // 🔹 Statikusan betöltött üzenetek
  const messages = { hu, en, de }[locale] || hu;

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
