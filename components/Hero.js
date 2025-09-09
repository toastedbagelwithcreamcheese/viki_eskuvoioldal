// components/Hero.js
'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

export default function Hero() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(0);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Cél dátum
    const targetDate = new Date('2026-06-06T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

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

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          highlightColor: 0xffffff,
          midtoneColor: 0xb5b5b5,
          lowlightColor: 0x909090,
          baseColor: 0xf5f5f5,
          minHeight: 200.0,
          minWidth: 200.0,
          speed: 1.0,
          zoom: 0.8,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      {/* Vanta háttér */}
      <div ref={vantaRef} className="absolute inset-0 z-0"></div>

      {/* Tartalom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 text-center px-4"
      >
        <h1
          className="text-5xl md:text-7xl font-serif font-bold text-white"
          style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.4)' }}
        >
          Viktória & Tomi
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 tracking-wide">
          2026. 06. 06.
        </p>

        {/* Számláló */}
        <div className="mt-10 flex justify-center space-x-6 md:space-x-12">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold">{timeLeft.days}</p>
            <p className="uppercase text-sm md:text-base">Days</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold">{timeLeft.hours}</p>
            <p className="uppercase text-sm md:text-base">Hours</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold">{timeLeft.minutes}</p>
            <p className="uppercase text-sm md:text-base">Minutes</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold">{timeLeft.seconds}</p>
            <p className="uppercase text-sm md:text-base">Seconds</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
