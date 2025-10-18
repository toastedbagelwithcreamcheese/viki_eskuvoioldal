import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['hu', 'en', 'de'],
  defaultLocale: 'hu',
  localeDetection: true,
});

export const config = {
  matcher: ['/', '/(hu|en|de)/:path*'],
};
