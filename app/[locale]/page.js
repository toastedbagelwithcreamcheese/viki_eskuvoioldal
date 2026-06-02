// app/[locale]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Hero from '../../components/Hero';
import Venue from '../../components/Venue';
import RsvpForm from '../../components/RsvpForm';
import DressCode from '../../components/DressCode';
import Info from '../../components/Info';
import Contact from '../../components/Contact';
import Gallery from '../../components/Gallery';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import PartyView from '../../components/PartyView';

export default function WeddingWebsite() {
  const t = useTranslations(); // Fordítási hook
  const [isPartyMode, setIsPartyMode] = useState(false);

  useEffect(() => {
    // Ugyanaz az időpont, amit a Hero-ban is beállítottál a visszaszámlálónak
    const targetDate = new Date('2026-06-01T17:00:00').getTime();

    const checkPartyTime = () => {
      const now = new Date().getTime();
      // Ha az aktuális idő elérte vagy átlépte a célidőpontot, buli mód bekapcsol
      if (now >= targetDate) {
        setIsPartyMode(true);
      } else {
        setIsPartyMode(false);
      }
    };

    // Azonnali ellenőrzés az oldal betöltésekor
    checkPartyTime();

    // Folyamatos ellenőrzés másodpercenként, hogy élőben váltson át,
    // ha a vendég pont megnyitva hagyta a böngészőt
    const timer = setInterval(checkPartyTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ha a számláló lejárt, CSAK a bulis felületet mutatjuk navigáció nélkül
  if (isPartyMode) {
    return <PartyView />;
  }

  // Egyébként a normál esküvői oldalt rendereljük
  return (
    <main className="min-h-screen font-body relative">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>

      <section id="venue" className="py-20 scroll-mt-20">
        <Venue />
      </section>

      <section id="rsvp" className="py-20 bg-gradient-to-b from-background to-muted/20 scroll-mt-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl">{t('Rsvp.title')}</h2>
          <p className="text-lg text-muted-foreground mt-4 mb-10">
            {t('Rsvp.description')}
          </p>
          <RsvpForm />
        </div>
      </section>

      <section id="info" className="py-20">
        <Info />
      </section>

      <section id="dresscode" className="py-20">
        <DressCode />
      </section>

      <section id="gallery" className="py-20">
        <Gallery />
      </section>

      <section id="contact" className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl">{t('Contact.title')}</h2>
          <p className="text-lg text-muted-foreground mt-4 mb-10">
            {t('Contact.subtitle')}
          </p>
          <Contact />
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </main>
  );
}