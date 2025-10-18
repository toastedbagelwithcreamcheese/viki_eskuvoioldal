import { getRequestConfig } from 'next-intl/server';

// 🔹 Statikus importok, hogy a Next.js build beágyazza őket
import hu from './messages/hu.json';
import en from './messages/en.json';
import de from './messages/de.json';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = ['hu', 'en', 'de'].includes(locale) ? locale : 'hu';

  const messages = {
    hu,
    en,
    de
  };

  return {
    locale: safeLocale,
    messages: messages[safeLocale] || messages.hu
  };
});
