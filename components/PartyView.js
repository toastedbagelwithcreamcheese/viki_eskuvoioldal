// components/PartyView.js
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import PhotoUploader from './PhotoUploader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PartyView() {
  const t = useTranslations('Party');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPhotos(data);
    };

    fetchPhotos();

    const channel = supabase
      .channel('realtime:photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, 
        (payload) => {
          setPhotos((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `wedding-party-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  // Csökkentett részecskeszám a stabilabb mobil memóriáért
  const particles = Array.from({ length: 12 });

  return (
    <div className="min-h-screen bg-black text-white pt-12 pb-24 px-4 relative overflow-hidden font-body">
      
      {/* --- MEMÓRIA-OPTIMALIZÁLT HÁTTÉR --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Maximum 4 db lebegő fotó, GPU gyorsítással */}
        {photos.slice(0, 4).map((photo, index) => {
          const animPaths = [
            { x: [0, 80, -30, 0], y: [0, -100, 50, 0] },
            { x: [0, -60, 50, 0], y: [0, 80, -60, 0] },
            { x: [30, -80, 20, 30], y: [-30, 60, -50, -30] },
            { x: [-50, 60, -20, -50], y: [50, -60, 30, 50] },
          ];
          const path = animPaths[index % animPaths.length];

          return (
            <motion.div
              key={`bg-${photo.id || index}`}
              className="absolute opacity-20 select-none"
              style={{
                top: `${15 + (index * 20)}%`,
                left: `${10 + (index * 20)}%`,
                width: '260px',
                height: '260px',
                filter: 'blur(20px)', // Kicsit enyhébb blur a simább futásért
                willChange: 'transform', // GPU gyorsítás bekapcsolása
              }}
              animate={path}
              transition={{
                duration: 20 + (index * 2),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Image
                src={photo.url}
                alt="Ambient Bokeh"
                fill
                sizes="260px"
                className="object-cover rounded-full"
                priority={index < 2}
              />
            </motion.div>
          );
        })}

        {/* Statikusabb/egyszerűbb prémium fénygömbök */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]" />

        {/* Optimalizált részecskék */}
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${(i * 8.5) % 100}%`,
              top: '100%',
              willChange: 'transform',
            }}
            animate={{ top: ['100%', '-5%'], opacity: [0, 0.5, 0] }}
            transition={{
              duration: 12 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-10" />
      </div>

      {/* --- TARTALOM --- */}
      <div className="relative z-20 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-12"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10">
            🔴 {t('live_tag') || 'ÉLŐ KÖZÖS FOTÓFAL'}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t('title') || 'Induljon a Buli! 🪩'}
          </h1>
          <p className="mt-3 text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-light leading-relaxed">
            {t('subtitle') || 'Lőjetek képeket a tánctéren, töltsétek fel ide, és nézzétek meg, ahogy azonnal megjelennek a közös falon!'}
          </p>

          <PhotoUploader />
        </motion.div>

        {/* Galéria rács */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-1">
          {photos.map((photo, index) => (
            <div
              key={photo.id || index}
              className="group relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 shadow-lg"
            >
              <Image
                src={photo.url}
                alt="Party moment"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => downloadImage(photo.url)}
                  className="px-4 py-2 rounded-full bg-white/20 border border-white/40 text-white font-medium text-xs backdrop-blur-sm"
                >
                  {t('save_button') || 'Mentés'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}