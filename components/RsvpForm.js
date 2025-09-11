// components/RsvpForm.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Check, Loader2, Plus, Trash2, User, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SpinnerIcon = () => (
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
    <Loader2 className="w-5 h-5 animate-spin" />
  </motion.div>
);

const SuccessIcon = () => (
  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
    <Check className="h-16 w-16 text-green-500 mx-auto" />
  </motion.div>
);

export default function RsvpForm() {
  const [isAttending, setIsAttending] = useState(true);
  // A vendég objektumot kiegészítettük a 'notes' mezővel
  const [guests, setGuests] = useState([{ name: '', needs_transfer: false, needs_accommodation: false, notes: '' }]);
  const [status, setStatus] = useState('idle');

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  const addGuest = () => {
    // Az új vendég is megkapja az üres 'notes' mezőt
    setGuests([...guests, { name: '', needs_transfer: false, needs_accommodation: false, notes: '' }]);
  };

  const removeGuest = (index) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // A csoportos RSVP-ből kivettük a megjegyzést
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .insert({ is_attending: isAttending })
      .select('id')
      .single();

    if (rsvpError) {
      console.error("Hiba az RSVP mentésekor:", rsvpError);
      setStatus('error'); return;
    }

    if (isAttending && guests.some(g => g.name.trim() !== '')) {
      // A vendégek küldésekor már a személyes 'notes' mezőt is mentjük
      const guestsToInsert = guests
        .filter(g => g.name.trim() !== '')
        .map(guest => ({
          rsvp_id: rsvpData.id,
          name: guest.name,
          needs_transfer: guest.needs_transfer,
          needs_accommodation: guest.needs_accommodation,
          notes: guest.notes, // Itt adjuk hozzá a személyes megjegyzést
        }));

      const { error: guestsError } = await supabase.from('guests').insert(guestsToInsert);

      if (guestsError) {
        console.error("Hiba a vendégek mentésekor:", guestsError);
        setStatus('error'); return;
      }
    }

    if(isAttending) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 rounded-xl shadow-xl max-w-2xl mx-auto">
        <SuccessIcon />
        <h3 className="text-3xl font-serif mt-4 text-emerald-700">Köszönjük a visszajelzésed!</h3>
        <p className="mt-2 text-gray-600">{isAttending ? 'Szeretettel várunk a nagy napon!' : 'Sajnáljuk, hogy nem tudsz velünk ünnepelni.'}</p>
      </motion.div>
    );
  }

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-8 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => setIsAttending(true)} className={`p-4 rounded-xl border-2 transition-all text-center font-medium text-lg ${isAttending ? 'bg-emerald-100 border-emerald-400' : 'bg-white'}`}>Ott leszek!</button>
        <button type="button" onClick={() => setIsAttending(false)} className={`p-4 rounded-xl border-2 transition-all text-center font-medium text-lg ${!isAttending ? 'bg-rose-100 border-rose-400' : 'bg-white'}`}>Nem tudok menni</button>
      </div>

      <AnimatePresence>
        {isAttending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">Vendégek adatai</label>
              <div className="space-y-4">
                {guests.map((guest, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="text-gray-400 flex-shrink-0" />
                      <input type="text" placeholder={`Vendég ${index + 1} neve`} value={guest.name} onChange={(e) => handleGuestChange(index, 'name', e.target.value)} className="w-full p-2 border-b-2 bg-transparent focus:outline-none focus:border-emerald-400 font-medium" required />
                      {guests.length > 1 && <button type="button" onClick={() => removeGuest(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>}
                    </div>
                    {/* ÚJ MEZŐ: Személyes megjegyzés */}
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-gray-400 flex-shrink-0" />
                        <input type="text" placeholder="Ételallergia, megjegyzés..." value={guest.notes} onChange={(e) => handleGuestChange(index, 'notes', e.target.value)} className="w-full p-2 border-b-2 bg-transparent focus:outline-none focus:border-emerald-400 text-sm" />
                    </div>
                    <div className="flex items-center justify-around pt-2 text-sm text-gray-600">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={guest.needs_transfer} onChange={(e) => handleGuestChange(index, 'needs_transfer', e.target.checked)} className="h-4 w-4 rounded" /> Transzfert kérek</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={guest.needs_accommodation} onChange={(e) => handleGuestChange(index, 'needs_accommodation', e.target.checked)} className="h-4 w-4 rounded" /> Szállást kérek</label>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button type="button" onClick={addGuest} className="flex items-center gap-2 text-emerald-700 mt-4 hover:underline"><Plus className="w-4 h-4" /> Új vendég hozzáadása</button>
            </div>
            {/* A csoportos megjegyzés mezőt innen kivettük */}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <button type="submit" disabled={status === 'sending'} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:to-emerald-700 transition-all">
          {status === 'sending' ? <SpinnerIcon /> : 'Visszajelzés elküldése'}
        </button>
      </div>
    </motion.form>
  );
}