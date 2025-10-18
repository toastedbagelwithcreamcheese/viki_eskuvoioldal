'use client';
import { motion } from 'framer-motion';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Venue() {
  const t = useTranslations('Venue');

  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Etyeki+Cz%C3%ADmeres+P%C3%A1linkah%C3%A1z';
  const embedUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2698.139423235275!2d18.74619881562519!3d47.44784797917454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741e7dc1db55c1b%3A0xb1a76790b50f759a!2sEtyeki%20Cz%C3%ADmeres%20P%C3%A1linkah%C3%A1z!5e0!3m2!1shu!2shu!4v1693759522123!5m2!1shu!2shu';

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Cím és leírás */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground mt-4">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-16 items-center">
          {/* Információs kártya */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 bg-card rounded-lg"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-card-foreground flex items-center gap-3 mb-3">
                <MapPin className="text-primary" />
                {t('locationTitle')}
              </h3>
              <p className="text-card-foreground font-bold">
                {t('venueName')}
              </p>
              <p className="text-muted-foreground">{t('venueAddress')}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-card-foreground flex items-center gap-3 mb-3">
                <Clock className="text-secondary" />
                {t('programsTitle')}
              </h3>
              <ul className="space-y-2 text-card-foreground">
                <li>
                  <span className="font-bold">16:00</span> – {t('welcome')}
                </li>
                <li>
                  <span className="font-bold">17:00</span> – {t('ceremony')}
                </li>
                <li>
                  <span className="font-bold">19:00</span> – {t('dinner')}
                </li>
              </ul>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              {t('directions')} <ExternalLink size={16} />
            </a>
          </motion.div>

          {/* Térkép */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-80 w-full rounded-lg overflow-hidden border"
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
