'use client';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const [status, setStatus] = useState('loading');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const t = useTranslations('Gallery');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    async function fetchImages() {
      setStatus('loading');

      const [galleryResult, partyResult] = await Promise.all([
        supabase.storage.from('gallery').list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        }),
        supabase.from('photos').select('id, url, created_at').order('created_at', { ascending: false }),
      ]);

      if (galleryResult.error && partyResult.error) {
        console.error('Hiba a képek betöltésekor:', galleryResult.error, partyResult.error);
        setStatus('error');
        return;
      }

      const imageFilePattern = /\.(avif|gif|jpe?g|png|webp)$/i;
      const galleryImages = (galleryResult.data || [])
        .filter((file) => imageFilePattern.test(file.name))
        .map((file) => ({
          id: `gallery-${file.id || file.name}`,
          src: supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl,
          createdAt: file.created_at || '',
        }));
      const partyImages = (partyResult.data || [])
        .filter((photo) => photo.url)
        .map((photo) => ({
          id: `party-${photo.id}`,
          src: photo.url,
          createdAt: photo.created_at || '',
        }));

      const uniqueImages = Array.from(
        new Map([...partyImages, ...galleryImages].map((image) => [image.src, image])).values()
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setImages(uniqueImages);
      setStatus('ready');
    }

    fetchImages();
  }, []);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <Camera className="mx-auto mb-4 h-10 w-10 text-primary-foreground/60" strokeWidth={1.5} />
          <h2 className="text-4xl text-foreground md:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        {images.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.045, 0.35), ease: [0.16, 1, 0.3, 1] }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-muted shadow-[0_14px_30px_hsl(24_20%_55%_/_0.12)] ${
                  index % 7 === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/5]'
                }`}
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox(index);
                  }
                }}
              >
                <Image
                  src={image.src}
                  alt={`${t('title')} ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 280px"
                  className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
              </motion.div>
            ))}
          </div>
        ) : status === 'loading' ? (
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5" aria-label={t('loading')}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`animate-pulse rounded-xl bg-muted ${index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/5]'}`} />
            ))}
          </div>
        ) : status === 'error' ? (
          <div className="mt-12 rounded-xl border border-border bg-muted/40 px-6 py-10 text-center text-muted-foreground">
            {t('error')}
          </div>
        ) : (
          <div className="mt-12 rounded-xl border border-border bg-muted/40 px-6 py-10 text-center text-muted-foreground">
            <p>{t('empty')}</p>
          </div>
        )}

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
