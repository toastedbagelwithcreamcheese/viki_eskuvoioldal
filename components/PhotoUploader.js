// components/PhotoUploader.js
'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PhotoUploader({ onUploadSuccess }) {
  const t = useTranslations('Party'); // 'Party' névteret használunk a json-ben
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Kulcsok a json-ből, fallback szövegekkel, ha még nem írtad be őket
    setStatus(t('status_compressing') || 'Kép optimalizálása... ⏳');

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setStatus(t('status_uploading') || 'Feltöltés a bulifalra... 🚀');

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .upload(fileName, compressedFile, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('photos')
        .insert([{ url: urlData.publicUrl }]);

      if (dbError) throw dbError;

      setStatus(t('status_success') || 'Sikeres feltöltés! 🎉');
      if (onUploadSuccess) onUploadSuccess(urlData.publicUrl);
    } catch (error) {
      console.error('Feltöltési hiba:', error);
      setStatus(t('status_error') || 'Hiba történt a feltöltéskor. ❌');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setStatus('');
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center my-6">
      <label className={`relative cursor-pointer group overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-1 shadow-xl transition-transform active:scale-95 ${uploading ? 'pointer-events-none opacity-70' : ''}`}>
        <span className="flex items-center justify-center rounded-full bg-black/90 px-8 py-4 text-white font-bold tracking-wide">
          {uploading ? status : (t('upload_button') || '📸 Lőj egy képet & Töltsd fel!')}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}