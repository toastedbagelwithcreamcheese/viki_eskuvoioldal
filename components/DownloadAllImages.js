// components/DownloadAllImages.js
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DownloadAllImages() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      // 1. Képek URL-jeinek lekérése az adatbázisból
      const { data, error } = await supabase.from('photos').select('url');
      
      if (error) throw error;
      if (!data || data.length === 0) {
        alert('Nincsenek letölthető képek a rendszerben.');
        setIsDownloading(false);
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder('eskuvoi_bulifotok'); // A ZIP-en belüli mappa neve

      // 2. Képek letöltése egyenként és hozzáadás a ZIP-hez
      let downloadedCount = 0;
      for (let i = 0; i < data.length; i++) {
        const photoUrl = data[i].url;
        try {
          const response = await fetch(photoUrl);
          const blob = await response.blob();
          
          // Fájlnév generálása (pl. photo_1.jpg)
          const fileName = `photo_${i + 1}.jpg`;
          folder.file(fileName, blob);
          
          downloadedCount++;
          setProgress(Math.round((downloadedCount / data.length) * 100));
        } catch (err) {
          console.error(`Hiba a következő kép letöltésekor: ${photoUrl}`, err);
        }
      }

      // 3. ZIP fájl legenerálása és letöltés indítása
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, 'eskuvoi_bulifotok.zip');

    } catch (error) {
      console.error('Hiba a tömeges letöltés során:', error);
      alert('Hiba történt a képek letöltésekor.');
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm
        ${isDownloading 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-gray-800'
        }`}
    >
      {isDownloading 
        ? `Letöltés és csomagolás... ${progress}%` 
        : '📥 Összes kép letöltése (.zip)'}
    </button>
  );
}