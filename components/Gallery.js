'use client';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Camera, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const HIGHLIGHT_VIDEO_ID = 'Abkf3og-gFA';
const HIGHLIGHT_VIDEO_URL = `https://www.youtube.com/watch?v=${HIGHLIGHT_VIDEO_ID}`;
// A videónál a YouTube-on jelenleg tiltva van a beágyazás, ezért a kártya a YouTube-on nyitja meg.
// Ha a tulajdonos bekapcsolja a beágyazást (YouTube Studio → videó → Továbbiak → Beágyazás engedélyezése),
// elég ezt true-ra állítani, és a videó helyben, az oldalon játszódik le.
const HIGHLIGHT_ALLOW_EMBED = false;

// A videókártya borítója: beágyazható videónál lejátszó gomb, egyébként link a YouTube-ra.
function HighlightPoster({ allowEmbed, onPlay, t }) {
  const content = (
    <>
      <Image
        src="/images/highlight-thumb.jpg"
        alt={t('highlightTitle')}
        fill
        sizes="(max-width: 768px) 100vw, 1100px"
        className="object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-foreground/25 transition-colors duration-300 group-hover:bg-foreground/35" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 motion-reduce:transition-none group-hover:scale-110">
        <Play className="ml-1 h-8 w-8 text-foreground" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="absolute left-5 top-5 rounded-full bg-black/45 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white backdrop-blur-sm">
        {t('highlightLabel')}
      </span>
    </>
  );

  const className = 'group absolute inset-0 h-full w-full cursor-pointer';

  if (allowEmbed) {
    return (
      <button type="button" onClick={onPlay} aria-label={t('highlightPlay')} className={className}>
        {content}
      </button>
    );
  }

  return (
    <a
      href={HIGHLIGHT_VIDEO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('highlightPlay')}
      className={`${className} block`}
    >
      {content}
    </a>
  );
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
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

        {/* Első "poszt": a highlight videó */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-[0_18px_40px_hsl(24_20%_55%_/_0.16)]">
            {videoPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${HIGHLIGHT_VIDEO_ID}?autoplay=1&rel=0`}
                title={t('highlightTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <HighlightPoster
                allowEmbed={HIGHLIGHT_ALLOW_EMBED}
                onPlay={() => setVideoPlaying(true)}
                t={t}
              />
            )}
          </div>
          <p className="mt-4 text-center text-base leading-relaxed text-muted-foreground">
            {t('highlightCaption')}
          </p>
          {!HIGHLIGHT_ALLOW_EMBED && (
            <p className="mt-2 text-center text-sm">
              <a
                href={HIGHLIGHT_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {t('highlightOpenYoutube')}
              </a>
            </p>
          )}
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
