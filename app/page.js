// app/page.js
'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Venue from '../components/Venue';
import RsvpForm from '../components/RsvpForm';
import DressCode from '../components/DressCode';
import Info from '../components/Info';
import Contact from '../components/Contact';
import Gallery from '../components/Gallery';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function WeddingWebsite() {
  return (
    // A main tag már a globals.css-ből kapja a stílust
    <main className="min-h-screen font-body relative">
      <Navbar />
        <div id="hero">
          <Hero />
        </div>

        {/* Minden szekciónak megadjuk a megfelelő id-t */}
        <section id="venue" className="py-20">
          <Venue />
        </section>

        {/* RSVP Szekció */}
        <section id="rsvp" className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl">Visszajelzés</h2>
            <p className="text-lg text-muted-foreground mt-4 mb-10">
              Kérjük, hogy részvételi
              szándékotokat legkésöbb 2026.
              március 20-ig jelezzétek. Ha úgy
              alakul, hogy nem tudtok velünk ünnepelni, természetesen teljes
              szívvel megértjük és elfogadjuk -
              arra kérünk, jelezzétek elöre, hogy
              ne várjon hiába egy szépen
              megterített hely az asztalnál.
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

        {/* Üzenj nekünk Szekció */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="text-4xl md:text-5xl">Üzenj nekünk!</h2>
            <p className="text-lg text-muted-foreground mt-4 mb-10">
              Ha bármi kérdésetek van, vagy csak egy kedves üzenetet küldenétek, itt megtehetitek.
            </p>
            <Contact />
          </div>
        </section>

        <ScrollToTopButton />
      <Footer />
    </main>
  );
}