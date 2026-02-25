'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Bus, ArrowRight, AlertTriangle, X, Info as InfoIcon, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function Info() {
  const t = useTranslations('Info');
  const locale = useLocale(); // <-- Lekérjük az aktuális nyelvet a linkeléshez
  const [selectedAcc, setSelectedAcc] = useState(null);

  // A szállások adatait áthoztuk ide, hogy a t() működjön rajtuk
  const accommodations = [
    {
      id: 'villa',
      name: t('villaName'),
      shortDesc: t('villaShortDesc'),
      description: t('villaDesc'),
      features: [
        t('villaF1'),
        t('villaF2'),
        t('villaF3'),
        t('villaF4')
      ],
      link: 'https://villaetyek.hu/',
      images: [
        '/villa2.png',
        '/villa1.png'
      ]
    },
    {
      id: 'flamingo',
      name: t('flamingoName'),
      shortDesc: t('flamingoShortDesc'),
      description: t('flamingoDesc'),
      features: [
        t('flamingoF1'),
        t('flamingoF2'),
        t('flamingoF3'),
        t('flamingoF4'),
        t('flamingoF5'),
        t('flamingoF6'),
        t('flamingoF7'),
        t('flamingoF8')
      ],
      link: 'https://flamingopanzioesborhaz.hu',
      programsLink: 'https://flamingopanzioesborhaz.hu/latnivalok/',
      images: [
        '/flamingo2.png',
        '/flamingo1.png'
      ]
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20 relative">
      <div className="container mx-auto px-6 max-w-5xl">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 mt-4">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-12">
          
          {/* Szállások szekció */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 bg-white rounded-xl shadow-lg flex flex-col relative"
          >
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold text-gray-700 flex items-center gap-3 mb-6">
                <Hotel className="text-amber-500" />
                {t('accommodationTitle')}
              </h3>
              
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 shadow-sm">
                <AlertTriangle className="text-rose-600 w-6 h-6 flex-shrink-0 mt-1" />
                <div className="text-sm text-rose-900 leading-relaxed">
                  <strong>{t('deadlineWarningTitle')}</strong> {t('deadlineWarningTextPre')}
                  <strong className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                    {t('deadlineWarningDate')}
                  </strong> 
                  {t('deadlineWarningTextPost')}
                </div>
              </div>

              <ul className="space-y-4 mb-6">
                {accommodations.map((acc) => (
                  <li key={acc.id}>
                    <button
                      onClick={() => setSelectedAcc(acc)}
                      className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/30 transition-all group flex items-start justify-between"
                    >
                      <div>
                        <span className="font-bold text-gray-800 block mb-1">
                          {acc.name}
                        </span>
                        <span className="text-sm text-gray-500 block">{acc.shortDesc}</span>
                      </div>
                      <div className="bg-white p-2 rounded-full shadow-sm text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <InfoIcon size={18} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* FIGYELEM: Itt már a locale-val fűzött link van! */}
            <Link 
              href={`/${locale}/booking`}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              {t('toBookingBtn')} <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Transzfer szekció */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="p-8 bg-white rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold text-gray-700 flex items-center gap-3 mb-4">
              <Bus className="text-sky-500" />
              {t('transferTitle')}
            </h3>
            <p className="text-gray-600 leading-relaxed">{t('transferDesc')}</p>
            <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100">
               <p className="text-sm text-sky-800 font-medium">{t('transferRsvp')}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Szállás Infó Modális Ablak */}
      <AnimatePresence>
        {selectedAcc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedAcc(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-2 gap-1 h-48 md:h-64 bg-gray-100 shrink-0">
                {selectedAcc.images.map((img, idx) => (
                  <div key={idx} className="relative w-full h-full">
                    <img src={img} alt={`${selectedAcc.name} kép ${idx + 1}`} className="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                <h3 className="text-3xl font-serif text-gray-900 mb-2">
                  {selectedAcc.name}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedAcc.description}
                </p>

                <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('usefulInfo')}</h4>
                <ul className="space-y-2 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedAcc.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 flex-wrap">
                  <a href={selectedAcc.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm">
                    {t('originalWebsite')} <ExternalLink size={16} />
                  </a>
                  {selectedAcc.programsLink && (
                    <a href={selectedAcc.programsLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-xl transition-colors text-sm border border-sky-100">
                      {t('programsLink')} <ExternalLink size={16} />
                    </a>
                  )}
                  
                  {/* FIGYELEM: Itt is a locale-val fűzött link van! */}
                  <Link 
                    href={`/${locale}/booking`} 
                    onClick={() => setSelectedAcc(null)} 
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm w-full sm:w-auto sm:ml-auto"
                  >
                    {t('selectBtn')} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}