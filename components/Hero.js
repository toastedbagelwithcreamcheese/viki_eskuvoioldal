'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // A ceremónia pontos ideje (17:00)
    const targetDate = new Date('2026-06-06T17:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Segédfüggvény (pl. 9 → 09)
  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center text-white">
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

        {/* Dátum */}
        <p
          className="mt-4 text-xl md:text-2xl tracking-widest uppercase font-body"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {t('date')}
        </p>

        {/* Visszaszámláló */}
        <div className="mt-12 md:mt-16 flex justify-center items-end space-x-4 md:space-x-8 backdrop-blur-sm bg-white/10 p-4 md:p-6 rounded-lg border border-white/20">
          <div className="text-center w-20">
            <p className="text-4xl md:text-6xl font-heading tracking-tighter">
              {formatNumber(timeLeft.days)}
            </p>
            <p className="uppercase text-xs md:text-sm font-body tracking-wider">
              {t('days')}
            </p>
          </div>
          <div className="text-center w-20">
            <p className="text-4xl md:text-6xl font-heading tracking-tighter">
              {formatNumber(timeLeft.hours)}
            </p>
            <p className="uppercase text-xs md:text-sm font-body tracking-wider">
              {t('hours')}
            </p>
          </div>
          <div className="text-center w-20">
            <p className="text-4xl md:text-6xl font-heading tracking-tighter">
              {formatNumber(timeLeft.minutes)}
            </p>
            <p className="uppercase text-xs md:text-sm font-body tracking-wider">
              {t('minutes')}
            </p>
          </div>
          <div className="text-center w-20">
            <p className="text-4xl md:text-6xl font-heading tracking-tighter">
              {formatNumber(timeLeft.seconds)}
            </p>
            <p className="uppercase text-xs md:text-sm font-body tracking-wider">
              {t('seconds')}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
