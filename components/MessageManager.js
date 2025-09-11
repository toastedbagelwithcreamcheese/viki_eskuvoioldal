// components/MessageManager.js
'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CornerUpLeft } from 'lucide-react';

export default function MessageManager({ messages }) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = (message) => {
    setIsSending(true);

    const templateParams = {
      to_name: message.name,
      to_email: message.email,
      reply_message: replyText,
    };

    emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    ).then((response) => {
       console.log('SUCCESS!', response.status, response.text);
       alert('Válasz sikeresen elküldve!');
       setReplyingTo(null);
       setReplyText('');
    }, (err) => {
       console.log('FAILED...', err);
       alert('Hiba történt a válasz küldésekor.');
    }).finally(() => {
        setIsSending(false);
    });
  };

  return (
    <div className="space-y-4">
      {messages.length > 0 ? messages.map(msg => (
        <div key={msg.id} className="p-4 bg-white rounded-lg shadow border-l-4 border-gray-200">
          <p className="text-gray-600 italic">"{msg.message}"</p>
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <div>
                <p className="font-semibold text-gray-800">{msg.name}</p>
                <p className="text-xs text-gray-500">{msg.email}</p>
            </div>
            <button
                onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
            >
                <CornerUpLeft size={16} /> Válasz
            </button>
          </div>

          <AnimatePresence>
            {replyingTo === msg.id && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Válasz ${msg.name} részére...`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                <button
                  onClick={() => handleSendReply(msg)}
                  disabled={isSending || !replyText}
                  className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  <Send size={16} /> {isSending ? 'Küldés...' : 'Válasz elküldése'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )) : <p className="text-center p-8 text-gray-500 bg-white rounded-lg shadow">Még nem érkezett üzenet.</p>}
    </div>
  );
}