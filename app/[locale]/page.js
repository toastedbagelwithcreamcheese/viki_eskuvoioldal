// app/[locale]/page.js
//tesztkomment
'use client';
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

export default function WeddingWebsite() {
  const t = useTranslations(); // Fordítási hook

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
