// components/PartyView.js
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PhotoUploader from './PhotoUploader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PartyView() {
  const [photos, setPhotos] = useState([]);

  // Képek betöltése és Realtime feliratkozás
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPhotos(data);
    };

    fetchPhotos();

    // Valós idejű figyelés az új képekre
    const channel = supabase
      .channel('realtime:photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, 
        (payload) => {
          // Új kép hozzáadása a lista elejére dinamikusan
          setPhotos((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Kép letöltése (Böngészős letöltés kényszerítése)
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

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="min-h-screen bg-slate-950 text-white pt-12 pb-24 px-4 relative overflow-hidden"
    >
      {/* Neon háttér effektek */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Fejléc */}
      <div className="max-w-4xl mx-auto text-center relative z-10 mt-6">
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
        >
          Induljon a Buli! 🪩
        </motion.h1>
        <p className="mt-2 text-slate-400 text-sm md:text-base">
          Készítsétek a legjobb pillanatokat, töltsétek fel, és mentsétek le a kedvenceiteket!
        </p>

        {/* Feltöltő komponens */}
        <PhotoUploader />
      </div>

      {/* Képrács (Masonry jellegű grid) */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id || index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg"
          >
            <Image
              src={photo.url}
              alt="Party moment"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover letöltő réteg */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => downloadImage(photo.url)}
                className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/40 transition-colors"
                title="Kép letöltése"
              >
                💾 {/* Ide tehetsz szép SVG ikont is */}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}