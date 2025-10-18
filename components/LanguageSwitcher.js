'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const locales = [
    { code: 'hu', flag: '🇭🇺' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'de', flag: '🇩🇪' }
  ];

  const changeLanguage = (nextLocale) => {
    router.replace(`/${nextLocale}${pathname.substring(3)}`);
  };

  return (
    <div className="flex space-x-2 mt-4">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => changeLanguage(l.code)}
          className={`px-3 py-1 border rounded ${
            locale === l.code ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
