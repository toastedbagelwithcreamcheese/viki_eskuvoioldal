'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Trash2, RefreshCw, AlertTriangle, Info } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BookingManager({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState(null);
  
  // Modális ablak állapota
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'reject', 'reset', 'force_approve'
    bookingId: null,
    roomId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: 'bg-amber-600 hover:bg-amber-700',
    icon: null
  });

  const router = useRouter();

  // --- MŰVELETEK ELŐKÉSZÍTÉSE (Ezek nyitják meg a modálist) ---

  const handleApproveClick = async (bookingId, roomId) => {
    setLoadingId(bookingId);
    
    // Biztonsági ellenőrzés: Megnézzük, nincs-e már kiadva
    const { data: roomCheck } = await supabase.from('rooms').select('status').eq('id', roomId).single();
    
    if (roomCheck.status === 'booked') {
      setLoadingId(null);
      setModalConfig({
        isOpen: true,
        type: 'force_approve',
        bookingId, roomId,
        title: 'Figyelem: Ezt a szobát már kiadtad!',
        message: 'Ezt a szobát már jóváhagytad egy másik foglaláshoz. Biztosan felülírod, és ennek a vendégnek is jóváhagyod?',
        confirmText: 'Igen, felülírom',
        confirmColor: 'bg-red-600 hover:bg-red-700 text-white',
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />
      });
      return;
    }

    // Ha szabad, azonnal jóváhagyjuk (ehhez nem kell extra kérdés, mert ez a "normál" folyamat)
    executeApprove(bookingId, roomId);
  };

  const handleRejectClick = (bookingId, roomId) => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      bookingId, roomId,
      title: 'Foglalás elutasítása',
      message: 'Biztosan elutasítod és törlöd ezt a foglalást? A szoba újra szabad lesz bárki számára a weboldalon.',
      confirmText: 'Elutasítás',
      confirmColor: 'bg-red-600 hover:bg-red-700 text-white',
      icon: <Trash2 className="w-6 h-6 text-red-600" />
    });
  };

  const handleResetClick = (bookingId, roomId) => {
    setModalConfig({
      isOpen: true,
      type: 'reset',
      bookingId, roomId,
      title: 'Státusz visszaállítása',
      message: 'Visszaállítod a foglalást "Függőben" státuszba? Ezzel a szobát újra zárolod mások elől, amíg nem döntesz a jóváhagyásról.',
      confirmText: 'Visszaállítás',
      confirmColor: 'bg-gray-800 hover:bg-gray-900 text-white',
      icon: <RefreshCw className="w-6 h-6 text-gray-800" />
    });
  };

  // --- VÉGLEGESÍTŐ FÜGGVÉNYEK (Ezek módosítják az adatbázist) ---

  const executeApprove = async (bookingId, roomId) => {
    setLoadingId(bookingId);
    await supabase.from('bookings').update({ status: 'approved' }).eq('id', bookingId);
    await supabase.from('rooms').update({ status: 'booked' }).eq('id', roomId);
    updateLocalState(bookingId, 'approved');
    setLoadingId(null);
    router.refresh(); 
  };

  const executeReject = async (bookingId, roomId) => {
    setLoadingId(bookingId);
    await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId);
    await supabase.from('rooms').update({ status: 'available' }).eq('id', roomId);
    updateLocalState(bookingId, 'rejected');
    setLoadingId(null);
    router.refresh();
  };

  const executeReset = async (bookingId, roomId) => {
    setLoadingId(bookingId);
    await supabase.from('bookings').update({ status: 'pending' }).eq('id', bookingId);
    await supabase.from('rooms').update({ status: 'pending' }).eq('id', roomId);
    updateLocalState(bookingId, 'pending');
    setLoadingId(null);
    router.refresh();
  };

  const confirmModalAction = () => {
    const { type, bookingId, roomId } = modalConfig;
    closeModal();
    
    if (type === 'force_approve') executeApprove(bookingId, roomId);
    if (type === 'reject') executeReject(bookingId, roomId);
    if (type === 'reset') executeReset(bookingId, roomId);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const updateLocalState = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  if (!bookings || bookings.length === 0) {
    return <p className="text-gray-500 italic p-4 bg-white rounded-lg shadow">Még nem érkezett szállásfoglalás.</p>;
  }

  return (
    <>
      {/* TÁBLÁZAT */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-12 border border-gray-100 relative">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Vendég</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Szállás / Szoba</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Éjszaka / Összeg</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Fizetési hivatkozás</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Megjegyzés</th>
              <th className="px-6 py-4 font-semibold text-center text-gray-700">Státusz</th>
              <th className="px-6 py-4 font-semibold text-center text-gray-700">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">{booking.guest_name}</p>
                  <p className="text-xs text-gray-500">{booking.guest_email || 'Nincs email'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-700">{booking.rooms?.accommodation_name}</p>
                  <p className="text-xs text-gray-500">{booking.rooms?.room_name}</p>
                </td>
                <td className="px-6 py-4">
                <p className="font-medium">{booking.nights} éj</p>
                <p className="text-sm font-bold text-amber-600">{booking.total_price.toLocaleString('hu-HU')} Ft</p>
                {(booking.ifa_adults > 0 || booking.breakfasts > 0 || booking.dinners > 0) && (
                    <div className="mt-1 text-[10px] text-gray-500 font-medium">
                    {booking.ifa_adults > 0 && <span>IFA: {booking.ifa_adults} fő<br/></span>}
                    {booking.breakfasts > 0 && <span>Reggeli: {booking.breakfasts} adag<br/></span>}
                    {booking.dinners > 0 && <span>Falusi tál: {booking.dinners} db</span>}
                    </div>
                )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-mono">
                    {booking.payment_reference}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="max-w-[150px] truncate text-gray-600" title={booking.notes}>
                    {booking.notes || '-'}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  {booking.status === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"><Clock size={12}/> Függőben</span>}
                  {booking.status === 'approved' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"><Check size={12}/> Jóváhagyva</span>}
                  {booking.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"><X size={12}/> Elutasítva</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {booking.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleApproveClick(booking.id, booking.room_id)}
                          disabled={loadingId === booking.id}
                          className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition disabled:opacity-50"
                          title="Jóváhagyás (Fizetve)"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleRejectClick(booking.id, booking.room_id)}
                          disabled={loadingId === booking.id}
                          className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition disabled:opacity-50"
                          title="Elutasítás (Szoba felszabadítása)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleResetClick(booking.id, booking.room_id)}
                        disabled={loadingId === booking.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        title="Státusz visszaállítása függőben lévőre"
                      >
                        <RefreshCw size={14} /> Módosítás
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EGYEDI MODÁLIS ABLAK */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  {modalConfig.icon || <Info className="w-6 h-6 text-gray-600" />}
                </div>
                
                <h3 className="text-2xl font-serif text-gray-900 mb-2">
                  {modalConfig.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                  {modalConfig.message}
                </p>

                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={closeModal}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                  >
                    Mégse
                  </button>
                  <button 
                    onClick={confirmModalAction}
                    className={`px-5 py-2.5 font-semibold rounded-xl transition shadow-sm hover:shadow-md flex items-center gap-2 ${modalConfig.confirmColor}`}
                  >
                    {modalConfig.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}