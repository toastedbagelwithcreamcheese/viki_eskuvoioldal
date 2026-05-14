// components/PhotoUploader.js
'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Inicializáld a Supabase klienst (vagy importáld a saját utils fájlodból, ha van)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PhotoUploader({ onUploadSuccess }) {
  const t = useTranslations(); // Ha szeretnéd többnyelvűsíteni
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('Kép optimalizálása... ⏳');

    // Tömörítési paraméterek (így a 10MB-os képből ~300KB lesz)
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setStatus('Feltöltés a bulifalra... 🚀');

      // Egyedi fájlnév generálása
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

      // 1. Feltöltés a Storage-ba ('wedding-photos' bucket)
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .upload(fileName, compressedFile, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      // 2. Publikus URL lekérése
      const { data: urlData } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(fileName);

      // 3. Mentés az adatbázisba ('photos' tábla)
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{ url: urlData.publicUrl }]);

      if (dbError) throw dbError;

      setStatus('Sikeres feltöltés! 🎉');
      if (onUploadSuccess) onUploadSuccess(urlData.publicUrl);
    } catch (error) {
      console.error('Feltöltési hiba:', error);
      setStatus('Hiba történt a feltöltéskor. ❌');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setStatus('');
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center my-6">
      <label className={`relative cursor-pointer group overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-1 transition-all duration-300 hover:scale-105 shadow-xl ${uploading ? 'pointer-events-none opacity-70' : ''}`}>
        <span className="flex items-center justify-center rounded-full bg-black/80 px-8 py-4 text-white font-bold tracking-wide transition-colors group-hover:bg-transparent">
          {uploading ? status : '📸 Lőj egy képet & Töltsd fel!'}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment" // Mobilkamera indítása
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}