import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// 🔹 Statikus importok – így a JSON-ok beépülnek a buildbe
import hu from '../../messages/hu.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';

export const metadata = {
  title: 'Viktória & Tomi Esküvője',
  description: 'Szeretettel meghívunk az esküvőnkre!',
};

export default async function RootLayout({ children, params }) {
  // 1. LÉPÉS: Megvárjuk a dinamikus paramétereket (Next.js 15 újítás!)
  const resolvedParams = await params;
  
  // 2. LÉPÉS: Ebből olvassuk ki a locale-t
  const locale = resolvedParams?.locale || 'hu';

  if (!['hu', 'en', 'de'].includes(locale)) notFound();

  // 🔹 Statikusan betöltött üzenetek
  const messages = { hu, en, de }[locale] || hu;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
