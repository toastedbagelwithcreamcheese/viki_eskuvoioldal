// app/page.js
'use client';

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
    <main className="min-h-screen text-gray-800 font-body relative bg-gradient-to-b from-[#fafafa] to-[#fdfdfd]">
        <Hero />
        <Venue />

        {/* RSVP Szekció */}
        <section id="rsvp" className="py-20 section-bg">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800">Visszajelzés</h2>
            <p className="text-lg text-gray-600 mt-4 mb-10">
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

        <Info />
        <DressCode />
        <Gallery />

        {/* Üzenj nekünk Szekció */}
        <section id="contact" className="py-20 section-bg">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800">Üzenj nekünk!</h2>
            <p className="text-lg text-gray-600 mt-4 mb-10">
              Ha bármi kérdésetek van, vagy csak egy kedves üzenetet küldenétek, itt megtehetitek.
            </p>
            <Contact />
          </div>
        </section>

        <ScrollToTopButton />
    </main>
  );
}
