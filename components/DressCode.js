'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Shirt, Diamond, ExternalLink, X, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

const inspirationImages = [
  { src: '/inspiration/1.png' },
  { src: '/inspiration/2.png' },
  { src: '/inspiration/3.png' },
  { src: '/inspiration/4.png' },
  { src: '/inspiration/5.png' },
  { src: '/inspiration/6.png' },
  { src: '/inspiration/7.png' },
  { src: '/inspiration/8.png' },
  { src: '/inspiration/9.png' },
];

export default function DressCode() {
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const t = useTranslations('DressCode');

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        {/* Cím és leírás */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Stílusdoboz */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 p-8 bg-gray-50 rounded-xl border border-gray-200"
        >
          <p className="text-xl font-semibold text-gray-700">
            {t('styleTitle')}{' '}
            <span className="font-bold text-gray-800">{t('styleName')}</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-8 text-left">
            {/* Hölgyeknek */}
            <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3">
                <Diamond className="text-gray-400 w-6 h-6" />
                <h3 className="text-xl font-semibold text-gray-800">
                  {t('forLadies')}
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {t('ladiesDesc')}
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex gap-4 flex-wrap justify-center">
                  <div
                    className="relative w-10 h-10 rounded-full bg-white border-2 border-red-300 flex items-center justify-center"
                    title={t('white')}
                  >
                    <X className="text-red-500 w-4 h-4" />
                  </div>
                  <div
                    className="relative w-10 h-10 rounded-full bg-red-600 border flex items-center justify-center"
                    title={t('red')}
                  >
                    <X className="text-white w-4 h-4" />
                  </div>
                  <div
                    className="relative w-10 h-10 rounded-full bg-black border flex items-center justify-center"
                    title={t('black')}
                  >
                    <X className="text-white w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Uraknak */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Shirt className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t('forGents')}
                </h3>
                <p className="text-gray-600">{t('gentsDesc')}</p>
              </div>
            </div>
          </div>

          {/* Színpaletta */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              {t('colorInspiration')}
            </h4>

            {/* Háromsoros színpaletta */}
            <div className="flex flex-col items-center gap-3">
              {/* Felső sor */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-[#E1BCC2]" />
                <div className="w-10 h-10 rounded-full bg-[#D8A87C]" />
                <div className="w-10 h-10 rounded-full bg-[#F3D6B9]" />
                <div className="w-10 h-10 rounded-full bg-[#A2AD97]" />
                <div className="w-10 h-10 rounded-full bg-[#9bdae9]" />
                <div className="w-10 h-10 rounded-full bg-[#97A5A2]" />
              </div>

              {/* Középső sor */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-[#B5838D]" />
                <div className="w-10 h-10 rounded-full bg-[#C58C5A]" />
                <div className="w-10 h-10 rounded-full bg-[#8E5E32]" />
                <div className="w-10 h-10 rounded-full bg-[#799163]" />
                <div className="w-10 h-10 rounded-full bg-[#68a1af]" />
                <div className="w-10 h-10 rounded-full bg-[#487266]" />
              </div>

              {/* Alsó sor */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-[#E6B7B7]" />
                <div className="w-10 h-10 rounded-full bg-[#F6E1A6]" />
                <div className="w-10 h-10 rounded-full bg-[#E9AE92]" />
                <div className="w-10 h-10 rounded-full bg-[#A2B3AE]" />
                <div className="w-10 h-10 rounded-full bg-[#C7D6C1]" />
                <div className="w-10 h-10 rounded-full bg-[#C9B7E6]" />
              </div>
            </div>

            {/* Inspirációs képek lenyíló */}
            <button
              onClick={() => setInspirationOpen(!inspirationOpen)}
              className="mt-4 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              <span>{t('showInspiration')}</span>
              <motion.div animate={{ rotate: inspirationOpen ? 180 : 0 }}>
                <ChevronDown size={20} />
              </motion.div>
            </button>

            {/* Lenyíló galéria */}
            <AnimatePresence>
              {inspirationOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                    {inspirationImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-64 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={image.src}
                          alt={`Inspirációs kép ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinterest link */}
            <div className="mt-8">
              <a
                href="https://hu.pinterest.com/search/pins/?q=garden%20formal%20pastel%20wedding%20guest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
              >
                {t('pinterest')} <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
