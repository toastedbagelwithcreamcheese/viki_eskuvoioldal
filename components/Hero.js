'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-4 text-center text-white">
      {/* Háttérkép Ken Burns effekttel */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1, x: 0, y: 0 }}
        animate={{ scale: 1.2, x: '-5%', y: '-5%' }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
      >
        <Image
          src="/images/0O9A2145.jpg"
          alt="Viktória és Tomi"
          fill
          quality={90}
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Finom sötétítő réteg */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Tartalom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="relative z-20 px-4"
      >
        {/* Nevek */}
        <h1
          className="text-6xl md:text-8xl lg:text-9xl font-heading text-shadow-lg"
          style={{
            fontFamily: 'var(--font-heading)',
            textShadow: '0 3px 10px rgba(0,0,0,0.5)',
          }}
        >
          Viktória & Tomi
        </h1>

        <p
          className="mt-5 text-lg font-medium tracking-[0.18em] md:text-xl"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {t('date')}
        </p>

        <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed md:text-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {t('message')}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 md:text-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {t('thanks')}
        </p>
      </motion.div>
    </section>
  );
}
