'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Check, Loader2, Plus, Trash2, User, MessageSquare, Hotel, Bus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SpinnerIcon = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <Loader2 className="w-5 h-5 animate-spin" />
  </motion.div>
);

const SuccessIcon = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
  >
    <Check className="h-16 w-16 text-green-500 mx-auto" />
  </motion.div>
);

export default function RsvpForm() {
  const t = useTranslations('Rsvp');

  const [isAttending, setIsAttending] = useState(true);
  const [guests, setGuests] = useState([
    { name: '', needs_transfer: false, needs_accommodation: false, notes: '' }
  ]);
  const [status, setStatus] = useState('idle');

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      { name: '', needs_transfer: false, needs_accommodation: false, notes: '' }
    ]);
  };

  const removeGuest = (index) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // 1. Létrehozzuk az RSVP főbejegyzést
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .insert({ is_attending: isAttending })
      .select('id')
      .single();

    if (rsvpError) {
      console.error('Hiba az RSVP mentésekor:', rsvpError);
      setStatus('error');
      return;
    }

    // 2. MENTJÜK A VENDÉGEKET AKKOR IS, HA NEM JÖNNEK
    // Csak azokat mentjük, akiknek van neve
    if (guests.some((g) => g.name.trim() !== '')) {
      const guestsToInsert = guests
        .filter((g) => g.name.trim() !== '')
        .map((guest) => ({
          rsvp_id: rsvpData.id,
          name: guest.name,
          // Ha nem jönnek, a transzfer/szállás automatikusan false marad
          needs_transfer: isAttending ? guest.needs_transfer : false,
          needs_accommodation: isAttending ? guest.needs_accommodation : false,
          notes: guest.notes
        }));

      const { error: guestsError } = await supabase
        .from('guests')
        .insert(guestsToInsert);

      if (guestsError) {
        console.error('Hiba a vendégek mentésekor:', guestsError);
        setStatus('error');
        return;
      }
    }

    if (isAttending)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    setStatus('success');
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10 rounded-xl shadow-xl max-w-2xl mx-auto bg-white/90 backdrop-blur"
      >
        <SuccessIcon />
        <h3 className="text-3xl font-serif mt-4 text-emerald-700">
          {t('successTitle')}
        </h3>
        <p className="mt-2 text-gray-600 mb-8">
          {isAttending ? t('successAttending') : t('successNotAttending')}
        </p>

        {/* Gomb a szállásfoglaláshoz, ha jönnek */}
        {isAttending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-500 mb-3">
              Szeretnél szállást foglalni a helyszínen?
            </p>
            <Link 
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow-md transition-all transform hover:scale-105"
            >
              <Hotel className="w-5 h-5" />
              Tovább a szobákhoz
            </Link>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-8 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg max-w-2xl mx-auto"
    >
      {/* IGEN / NEM Gombok */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setIsAttending(true)}
          className={`p-4 rounded-xl border-2 transition-all text-center font-medium text-lg ${
            isAttending
              ? 'bg-emerald-100 border-emerald-400'
              : 'bg-white border-gray-200'
          }`}
        >
          {t('attending')}
        </button>
        <button
          type="button"
          onClick={() => setIsAttending(false)}
          className={`p-4 rounded-xl border-2 transition-all text-center font-medium text-lg ${
            !isAttending
              ? 'bg-rose-100 border-rose-400'
              : 'bg-white border-gray-200'
          }`}
        >
          {t('notAttending')}
        </button>
      </div>

      {/* ÚJ RÉSZ: TRANSZFER INFORMÁCIÓS DOBOZ (Csak akkor látszik, ha jönnek) */}
      <AnimatePresence>
        {isAttending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 text-amber-900 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-base text-amber-800">
                <Bus className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <h4>{t('transferInfoTitle')}</h4>
              </div>
              <p className="text-sm leading-relaxed text-amber-900/90 font-medium">
                {t('transferInfoDesc')}
              </p>
              <p className="text-xs italic pt-1 text-amber-700 font-semibold">
                {t('transferInfoCta')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendéglista */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {isAttending ? t('guestsTitle') : t('guestsTitleNotAttending')}
          </label>
          
          <div className="space-y-4">
            {guests.map((guest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg space-y-4 ${
                  isAttending ? 'bg-gray-50/50' : 'bg-rose-50/30 border-rose-100'
                }`}
              >
                {/* Név megadása */}
                <div className="flex items-center gap-3">
                  <User className={`flex-shrink-0 ${isAttending ? 'text-gray-400' : 'text-rose-300'}`} />
                  <input
                    type="text"
                    placeholder={t('guestNamePlaceholder', {
                      number: index + 1
                    })}
                    value={guest.name}
                    onChange={(e) =>
                      handleGuestChange(index, 'name', e.target.value)
                    }
                    className="w-full p-2 border-b-2 bg-transparent focus:outline-none focus:border-emerald-400 font-medium"
                    required
                  />
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Megjegyzés mező */}
                <div className="flex items-center gap-3">
                  <MessageSquare className={`flex-shrink-0 ${isAttending ? 'text-gray-400' : 'text-rose-300'}`} />
                  <input
                    type="text"
                    placeholder={t('guestNotesPlaceholder')}
                    value={guest.notes}
                    onChange={(e) =>
                      handleGuestChange(index, 'notes', e.target.value)
                    }
                    className="w-full p-2 border-b-2 bg-transparent focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                {/* Szállás és Transzfer - CSAK AKKOR HA JÖNNEK */}
                <AnimatePresence>
                  {isAttending && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-around pt-2 text-sm text-gray-600 overflow-hidden"
                    >
                      <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={guest.needs_transfer}
                          onChange={(e) =>
                            handleGuestChange(
                              index,
                              'needs_transfer',
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded accent-emerald-600"
                        />{' '}
                        {t('requestTransfer')}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={guest.needs_accommodation}
                          onChange={(e) =>
                            handleGuestChange(
                              index,
                              'needs_accommodation',
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded accent-emerald-600"
                        />{' '}
                        {t('requestAccommodation')}
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addGuest}
            className={`flex items-center gap-2 mt-4 hover:underline font-medium ${
               isAttending ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            <Plus className="w-4 h-4" /> {t('addGuest')}
          </button>
        </div>
      </motion.div>

      <div className="text-center">
        <button
          type="submit"
          disabled={status === 'sending'}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md text-white transition-all ${
             isAttending 
             ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:to-emerald-700'
             : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:to-rose-700'
          }`}
        >
          {status === 'sending' ? <SpinnerIcon /> : t('submit')}
        </button>
        {status === 'error' && (
          <p className="text-red-500 mt-2 text-sm">{t('error')}</p>
        )}
      </div>
    </motion.form>
  );
}