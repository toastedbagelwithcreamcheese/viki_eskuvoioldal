// components/Contact.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Check, Loader2, Send } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SpinnerIcon = () => ( <Loader2 className="w-5 h-5 animate-spin" /> );

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Új állapot az emailnek
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Az emailt is elmentjük az adatbázisba
    const { error } = await supabase.from('messages').insert({ name, email, message });

    if (error) {
      console.error("Hiba az üzenet mentésekor:", error);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-emerald-50 rounded-xl">
            <Check className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-serif mt-4 text-emerald-800">Üzenet elküldve!</h3>
            <p className="mt-2 text-gray-600">Köszönjük szépen! Hamarosan válaszolunk, ha szükséges.</p>
        </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Neved</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="Hogy hívnak?" />
      </div>
      {/* ÚJ EMAIL MEZŐ */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">E-mail címed</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="hova küldhetjük a választ?" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Üzeneted</label>
        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="Írj nekünk valami kedveset..." />
      </div>
      <div className="text-center">
        <button type="submit" disabled={status === 'sending'} className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold shadow-md text-white bg-gray-700 hover:bg-gray-800 transition-all disabled:bg-gray-400">
          {status === 'sending' ? <SpinnerIcon /> : <Send size={16} />}
          {status === 'sending' ? 'Küldés...' : 'Üzenet küldése'}
        </button>
        {status === 'error' && <p className="text-red-500 mt-2 text-sm">Hiba történt. Kérjük, próbáld újra később.</p>}
      </div>
    </form>
  );
}