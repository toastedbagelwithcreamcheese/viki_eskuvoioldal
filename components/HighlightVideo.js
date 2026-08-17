'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
        alt={t('title')}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1100px"
        className="object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-foreground/25 transition-colors duration-300 group-hover:bg-foreground/35" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 motion-reduce:transition-none group-hover:scale-110">
        <Play className="ml-1 h-8 w-8 text-foreground" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="absolute left-5 top-5 rounded-full bg-black/45 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white backdrop-blur-sm">
        {t('label')}
      </span>
    </>
  );

  const className = 'group absolute inset-0 h-full w-full cursor-pointer';

  if (allowEmbed) {
    return (
      <button type="button" onClick={onPlay} aria-label={t('play')} className={className}>
        {content}
      </button>
    );
  }

  return (
    <a
      href={HIGHLIGHT_VIDEO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('play')}
      className={`${className} block`}
    >
      {content}
    </a>
  );
}

export default function HighlightVideo() {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const t = useTranslations('Highlight');
  const reduceMotion = useReducedMotion();

  return (
    <div className="container mx-auto max-w-6xl px-6">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h2 className="text-4xl text-foreground md:text-5xl">{t('title')}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t('caption')}
        </p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-[0_18px_40px_hsl(24_20%_55%_/_0.16)]">
          {videoPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${HIGHLIGHT_VIDEO_ID}?autoplay=1&rel=0`}
              title={t('title')}
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
        {!HIGHLIGHT_ALLOW_EMBED && (
          <p className="mt-4 text-center text-sm">
            <a
              href={HIGHLIGHT_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              {t('openYoutube')}
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
}
