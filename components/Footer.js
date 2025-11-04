'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="relative mt-20 py-20 overflow-hidden">
      {/* Finom háttérminta a footer mögött */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/liquid-cheese.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
        }}
      ></div>

      {/* Sötétítő réteg a szöveg olvashatóságához */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="container mx-auto px-6 text-center relative z-20"
      >
        <Heart className="mx-auto h-10 w-10 text-primary mb-6" />

        <h2
          className="text-4xl md:text-5xl font-heading text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t('title')}
        </h2>

        <p className="mt-4 text-muted-foreground">{t('subtitle')}</p>

        <div className="mt-10 border-t border-border pt-8">
          <p className="font-heading text-2xl text-foreground">Viktória & Tomi</p>
          <p className="mt-1 text-sm text-muted-foreground tracking-widest">
            {t('date')}
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Viktória & Tomi. {t('rights')}
          </p>

          {/* Készítői rész */}
          <div className="mt-8 border-t border-border/50 pt-6 text-xs text-muted-foreground">
            <p>
              {t('createdBy')} <span className="font-semibold">Kovács Bálint</span>
            </p>
            <div className="mt-2 flex justify-center items-center gap-x-4">
              <a
                href="mailto:kapcsolat@kovacsbalintfoto.hu"
                className="hover:text-foreground transition-colors"
              >
                kapcsolat@kovacsbalintfoto.hu
              </a>
              <span>&bull;</span>
              <a
                href="tel:+36308723777"
                className="hover:text-foreground transition-colors"
              >
                +36 30 872 3777
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
