// components/DressCode.js
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Shirt, Diamond, ExternalLink, X, ChevronDown } from 'lucide-react';

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

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">Dress Code</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Kérünk Benneteket, hogy öltözéketekkel is emeljétek az este fényét, lágy pasztell színekkel.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 p-8 bg-gray-50 rounded-xl border border-gray-200"
        >
          <p className="text-xl font-semibold text-gray-700">A választott stílus: <span className="font-bold text-gray-800">Garden Formal</span></p>
          
          <div className="grid md:grid-cols-2 gap-8 my-8 text-left">
            {/* Hölgyeknek */}
            <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <Diamond className="text-gray-400 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-800">Hölgyeknek</h3>
          </div>

          <p className="text-gray-600 leading-relaxed">
            Ha ruhára esne a választás: elegáns maxi vagy midi ruha
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex gap-4 flex-wrap justify-center">
              <div
                className="relative w-10 h-10 rounded-full bg-white border-2 border-red-300 flex items-center justify-center"
                title="Fehér"
              >
                <X className="text-red-500 w-4 h-4" />
              </div>
              <div
                className="relative w-10 h-10 rounded-full bg-red-600 border flex items-center justify-center"
                title="Piros"
              >
                <X className="text-white w-4 h-4" />
              </div>
              <div
                className="relative w-10 h-10 rounded-full bg-black border flex items-center justify-center"
                title="Fekete"
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
                <h3 className="text-lg font-semibold text-gray-800">Uraknak</h3>
                <p className="text-gray-600">Szolidan elegáns (smart casual) öltözet: zakó, ing, elegáns nadrág - nyakkendő nem kötelező</p>
              </div>
            </div>
          </div>

          {/* FRISSÍTETT Színpaletta és inspiráció */}
          <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Szín inspiráció</h4>
              
              {/* Háromsoros színpaletta */}
<div className="flex flex-col items-center gap-3">
  {/* Felső sor: Melegebb / Világosabb árnyalatok */}
  <div className="flex justify-center gap-3 flex-wrap">
    <div className="w-10 h-10 rounded-full bg-[#E1BCC2]" title="Fakó rózsaszín"></div>
    <div className="w-10 h-10 rounded-full bg-[#D8A87C]" title="Okker"></div>
    <div className="w-10 h-10 rounded-full bg-[#F3D6B9]" title="Barack"></div>
    <div className="w-10 h-10 rounded-full bg-[#A2AD97]" title="Világos zsálya"></div>
    <div className="w-10 h-10 rounded-full bg-[#9bdae9]" title="Világos kék"></div>
    <div className="w-10 h-10 rounded-full bg-[#97A5A2]" title="Szürkészöld"></div>
  </div>

  {/* Középső sor: Sötétebb, földszínek */}
  <div className="flex justify-center gap-3 flex-wrap">
    <div className="w-10 h-10 rounded-full bg-[#B5838D]" title="Mályva"></div>
    <div className="w-10 h-10 rounded-full bg-[#C58C5A]" title="Rozsdabarna"></div>
    <div className="w-10 h-10 rounded-full bg-[#8E5E32]" title="Barna"></div>
    <div className="w-10 h-10 rounded-full bg-[#799163]" title="Zsályazöld"></div>
    <div className="w-10 h-10 rounded-full bg-[#68a1af]" title="Világos kék"></div>
    <div className="w-10 h-10 rounded-full bg-[#487266]" title="Sötétzöld"></div>
  </div>

{/* Alsó sor: Lágy pasztell árnyalatok (6 szín) */}
<div className="flex justify-center gap-3 flex-wrap">
  <div className="w-10 h-10 rounded-full bg-[#E6B7B7]" title="Pasztell rózsaszín"></div>
  <div className="w-10 h-10 rounded-full bg-[#F6E1A6]" title="Pasztell sárga"></div>
  <div className="w-10 h-10 rounded-full bg-[#E9AE92]" title="Pasztell barack"></div>
  <div className="w-10 h-10 rounded-full bg-[#A2B3AE]" title="Pasztell szürkészöld"></div>
  <div className="w-10 h-10 rounded-full bg-[#C7D6C1]" title="Pasztell világoszöld"></div>
  <div className="w-10 h-10 rounded-full bg-[#C9B7E6]" title="Pasztell levendula"></div>
</div>

</div>


              {/* ÚJ: Lenyíló gomb */}
            <button
              onClick={() => setInspirationOpen(!inspirationOpen)}
              className="mt-4 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              <span>Inspirációs képek mutatása</span>
              <motion.div animate={{ rotate: inspirationOpen ? 180 : 0 }}>
                <ChevronDown size={20} />
              </motion.div>
            </button>

            {/* ÚJ: Lenyíló galéria */}
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
                      <div key={index} className="relative h-64 overflow-hidden rounded-lg">
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
            
            {/* FRISSÍTETT Pinterest link */}
            <div className="mt-8">
               <a href="https://hu.pinterest.com/search/pins/?q=garden%20formal%20pastel%20wedding%20guest" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
                  Inspirálódj a Pinteresten! <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}