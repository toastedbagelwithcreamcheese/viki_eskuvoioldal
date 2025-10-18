import { getRequestConfig } from 'next-intl/server';
import path from 'path';
import fs from 'fs';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = ['hu', 'en', 'de'].includes(locale) ? locale : 'hu';
  const filePath = path.join(process.cwd(), 'messages', `${safeLocale}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  return {
    locale: safeLocale,
    messages,
  };
});
