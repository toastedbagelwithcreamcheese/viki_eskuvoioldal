'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const t = useTranslations('Gallery');

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.storage.from('gallery').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        console.error('Hiba a képek betöltésekor:', error);
        return;
      }

      const imageUrls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(file.name);
        return { src: publicUrl, name: file.name };
      });

      setImages(imageUrls);
    }

    fetchImages();
  }, []);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Cím és leírás */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 mt-4">{t('subtitle')}</p>
        </motion.div>

        {/* Galéria képek vagy üzenet */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {images.map((image, index) => (
              <motion.div
                key={image.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="aspect-square relative overflow-hidden rounded-lg shadow-md cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={`${t('title')} ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12 text-gray-500">
            <p>{t('loading')}</p>
          </div>
        )}

        {/* Lightbox megjelenítése */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={images}
          index={lightboxIndex}
        />
      </div>
    </section>
  );
}
