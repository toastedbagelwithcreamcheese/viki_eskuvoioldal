// components/DressCode.js
'use client';
import { motion } from 'framer-motion';
import { Shirt, Diamond, ExternalLink, X } from 'lucide-react';

export default function DressCode() {
  return (
    <section className="py-20 bg-white">
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
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Diamond className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Hölgyeknek</h3>
                <p className="text-gray-600">Elegáns maxi vagy midi ruha.</p>
              </div>
            </div>
            {/* Uraknak */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Shirt className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Uraknak</h3>
                <p className="text-gray-600">Smart casual öltözet: zakó, ing, elegáns nadrág – nyakkendő nem kötelező.</p>
              </div>
            </div>
          </div>

          {/* Színpaletta és inspiráció */}
          <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Inspiráció</h4>
              <p className="text-sm text-gray-500 mt-2 mb-4">Ajánlott pasztell árnyalatok:</p>
              <div className="flex justify-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-[#e6e0d4] border border-gray-200" title="Bézs"></div>
                  <div className="w-10 h-10 rounded-full bg-[#d4e6e1] border border-gray-200" title="Zsálya"></div>
                  <div className="w-10 h-10 rounded-full bg-[#e1d4e6] border border-gray-200" title="Levendula"></div>
                  <div className="w-10 h-10 rounded-full bg-[#d4d4e6] border border-gray-200" title="Halványkék"></div>
                  <div className="w-10 h-10 rounded-full bg-[#e6d4d4] border border-gray-200" title="Púderrózsaszín"></div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">Finoman jeleznénk, hogy a hölgyek kerüljék az alábbi színeket:</p>
                 <div className="flex justify-center gap-4 flex-wrap">
                    <div className="relative w-10 h-10 rounded-full bg-white border-2 border-red-300" title="Fehér"><X className="absolute inset-0 m-auto text-red-500" /></div>
                    <div className="relative w-10 h-10 rounded-full bg-red-600 border" title="Piros"><X className="absolute inset-0 m-auto text-white" /></div>
                    <div className="relative w-10 h-10 rounded-full bg-black border" title="Fekete"><X className="absolute inset-0 m-auto text-white" /></div>
                 </div>
              </div>

              {/* Inspirációs link */}
              <div className="mt-8">
                 <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
                    További ötletek és inspirációk <ExternalLink size={16} />
                </a>
              </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}