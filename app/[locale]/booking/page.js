'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Users, Check, X, CreditCard, Info, Clock, Coffee } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Supabase kliens inicializálása
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BookingPage() {
  const t = useTranslations('Booking');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Form state kiegészítve az új mezőkkel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nights: 1, // Flamingóhoz és Villához is: 1 vagy 2
    paymentRef: '',
    notes: '',
    acceptedTerms: false,
    adults: 2, // IFA miatt (alapértelmezett)
    breakfasts: 0,
    dinners: 0
  });

  // Határidő ellenőrzése (2026. április 15.)
  const deadline = new Date('2026-04-15T23:59:59');
  const isExpired = new Date() > deadline;

  // 1. Szobák betöltése az adatbázisból
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('id', { ascending: true });

    if (error) console.error('Hiba a szobák betöltésekor:', error);
    else setRooms(data || []);
    setLoading(false);
  };

  // 2. Szoba kiválasztása
  const handleSelectRoom = (room) => {
    if (room.status !== 'available' || isExpired) return;
    setSelectedRoom(room);
    // Reseteljük a formot, de beállítjuk az alapértelmezett felnőtt számot a szoba kapacitása alapján
    setFormData({ 
      ...formData, 
      nights: 1, 
      paymentRef: '', 
      acceptedTerms: false,
      adults: room.capacity > 2 ? 2 : room.capacity, 
      breakfasts: 0, 
      dinners: 0,
      name: '',
      email: '',
      notes: ''
    }); 
  };

// 3. Árkalkuláció
  const calculatePrice = () => {
    if (!selectedRoom) return 0;
    
    // Villa Chardonnay (fix ár 1 éjre, kedvezményes ár 2 éjre)
    if (selectedRoom.accommodation_name === 'Villa Chardonnay') {
      if (formData.nights === 1) {
        return selectedRoom.price_per_night; // 45.000 Ft
      } else {
        return 36000 * 2; // 20% kedvezmény: 36.000 Ft/éj -> 72.000 Ft
      }
    }
    
    // Flamingó (dinamikus ár + extrák)
    let total = 0;
    if (formData.nights === 1) {
      total = selectedRoom.price_1_night;
    } else {
      total = selectedRoom.price_2_nights_per_night * 2; // 2 éjszaka ára
    }

    // Extrák hozzáadása (csak a Flamingónál van értelme)
    if (selectedRoom.accommodation_name === 'Flamingó Borház') {
        total += formData.adults * formData.nights * 600; // IFA (600 Ft/fő/éj)
        total += formData.breakfasts * formData.nights * 5000; // Reggeli (5000 Ft/fő/nap)
        total += formData.dinners * 15000; // Falusi tál (15.000 Ft/tál - ez egyszeri alkalom)
    }

    return total;
  };

  // 4. Foglalás beküldése
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    setErrorMessage('');

    try {
      // 4.1 Ellenőrizzük, hogy még mindig szabad-e a szoba
      const { data: checkRoom } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', selectedRoom.id)
        .single();

      if (checkRoom.status !== 'available') {
        setErrorMessage(t('errTaken'));
        setBookingStatus('error');
        fetchRooms(); // Frissítjük a listát
        return;
      }

      const isFlamingo = selectedRoom.accommodation_name === 'Flamingó Borház';

      // 4.2 Foglalás beszúrása
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          guest_name: formData.name,
          guest_email: formData.email,
          room_id: selectedRoom.id,
          nights: formData.nights,
          total_price: calculatePrice(),
          payment_reference: formData.paymentRef,
          notes: formData.notes,
          status: 'pending',
          ifa_adults: isFlamingo ? formData.adults : 0,
          breakfasts: isFlamingo ? formData.breakfasts : 0,
          dinners: isFlamingo ? formData.dinners : 0
        });

      if (bookingError) throw bookingError;

      // 4.3 Szoba státuszának frissítése 'pending'-re
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'pending' })
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      setBookingStatus('success');
      fetchRooms(); // Lista frissítése a háttérben
      
    } catch (error) {
      console.error('Hiba:', error);
      setErrorMessage(t('errUnexpected'));
      setBookingStatus('error');
    }
  };

  // Csoportosítás megjelenítéshez
  const villaRooms = rooms.filter(r => r.accommodation_name === 'Villa Chardonnay');
  const flamingoRooms = rooms.filter(r => r.accommodation_name === 'Flamingó Borház');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Fejléc */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{t('title')}</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        {isExpired && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg inline-block font-bold">
            {t('expired')}
          </div>
        )}
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-6xl space-y-16">
        
        {/* VILLA CHARDONNAY SZEKCIÓ */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Hotel className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl font-serif text-gray-800">{t('villaTitle')}</h2>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-gray-600">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Clock size={18}/> {t('checkinOut')}</h4>
                   <ul className="list-disc list-inside text-sm space-y-1">
                      <li>{t('checkinVilla')}</li>
                      <li>{t('checkoutVilla')}</li>
                      <li>{t('babyBed')}</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Coffee size={18}/> {t('meals')}</h4>
                   <p className="text-sm">{t('mealsVilla')}</p>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villaRooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onSelect={() => handleSelectRoom(room)} 
                disabled={isExpired}
                t={t}
              />
            ))}
            {villaRooms.length === 0 && !loading && <p>{t('noRooms')}</p>}
          </div>
        </div>

        {/* FLAMINGÓ BORHÁZ SZEKCIÓ */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Hotel className="w-8 h-8 text-rose-600" />
            <h2 className="text-3xl font-serif text-gray-800">{t('flamingoTitle')}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-gray-600">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Clock size={18}/> {t('infos')}</h4>
                   <ul className="list-disc list-inside text-sm space-y-1">
                      <li>{t('checkinFlamingo')}</li>
                      <li>{t('checkoutFlamingo')}</li>
                      <li>{t('wellnessFlamingo')}</li>
                      <li>{t('ifaFlamingo')}</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Coffee size={18}/> {t('mealsOptional')}</h4>
                   <p className="text-sm mb-2">{t('breakfastFlamingo')}</p>
                   <p className="text-sm">{t('dinnerFlamingo')}</p>
                   <p className="text-xs text-gray-500 mt-2">{t('restaurantNote')}</p>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flamingoRooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onSelect={() => handleSelectRoom(room)} 
                disabled={isExpired}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODAL / POPUP ŰRLAP */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative"
            >
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>

              {bookingStatus === 'success' ? (
                // SIKERES FOGLALÁS KÉPERNYŐ
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-3xl font-serif text-green-800 mb-4">{t('successTitle')}</h3>
                  <p className="text-gray-600 mb-8">
                    {t('successDesc')}
                  </p>
                  <button 
                    onClick={() => { setSelectedRoom(null); setBookingStatus('idle'); }}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    {t('btnClose')}
                  </button>
                </div>
              ) : (
                // FOGLALÁSI ŰRLAP
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  <div className="p-6 md:p-8 border-b bg-gray-50">
                    <h3 className="text-2xl font-serif text-gray-800 mb-1">{t('formTitle')}</h3>
                    <p className="text-gray-600 font-medium">{selectedRoom.accommodation_name}</p>
                    <p className="text-sm text-gray-500">{selectedRoom.room_name}</p>
                  </div>

                  <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                    
                    {/* Hibaüzenet */}
                    {errorMessage && (
                      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    {/* Személyes adatok */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('formName')}</label>
                        <input 
                          required type="text" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('formEmail')}</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Éjszakák száma választó (MINDKÉT SZÁLLÁSNÁL LÁTSZIK) */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">{t('howManyNights')}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer p-3 rounded-lg border-2 text-center transition ${formData.nights === 1 ? 'border-amber-500 bg-white shadow-sm' : 'border-transparent bg-white/50 hover:bg-white'}`}>
                          <input 
                            type="radio" name="nights" className="hidden" 
                            checked={formData.nights === 1}
                            onChange={() => setFormData({...formData, nights: 1})}
                          />
                          <span className="block font-bold text-gray-800">{t('oneNight')}</span>
                          <span className="text-xs text-gray-500">{t('onlySat')}</span>
                        </label>
                        <label className={`cursor-pointer p-3 rounded-lg border-2 text-center transition ${formData.nights === 2 ? 'border-amber-500 bg-white shadow-sm' : 'border-transparent bg-white/50 hover:bg-white'}`}>
                          <input 
                            type="radio" name="nights" className="hidden" 
                            checked={formData.nights === 2}
                            onChange={() => setFormData({...formData, nights: 2})}
                          />
                          <span className="block font-bold text-gray-800">{t('twoNights')}</span>
                          <span className="text-xs text-gray-500">{t('friSat')}</span>
                        </label>
                      </div>

                      {/* Mindkét szállásnál megjelenik a 20%-os kiemelés, ha 2 éjszakát választ */}
                      {formData.nights === 2 && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold text-center flex items-center justify-center gap-2">
                           <Check size={16} /> {t('twoNightsDiscount')}
                        </div>
                      )}
                    </div>

                    {/* Flamingó speciális extrák (IFA, Reggeli, Vacsora) */}
                    {selectedRoom.accommodation_name === 'Flamingó Borház' && (
                      <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 space-y-5">
                        <h4 className="font-bold text-rose-900 border-b border-rose-200 pb-2">{t('detailsAndExtras')}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('adultsIfa')}<br/><span className="font-normal text-gray-500">600 Ft/fő/éj</span></label>
                            <input 
                               type="number" min="1" max={selectedRoom.capacity} 
                               className="w-full p-2 border rounded-lg outline-none" 
                               value={formData.adults} 
                               onChange={e => setFormData({...formData, adults: parseInt(e.target.value) || 1})} 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('breakfastPortion')}<br/><span className="font-normal text-gray-500">5.000 Ft/fő/nap</span></label>
                            <input 
                               type="number" min="0" max="10" 
                               className="w-full p-2 border rounded-lg outline-none" 
                               value={formData.breakfasts} 
                               onChange={e => setFormData({...formData, breakfasts: parseInt(e.target.value) || 0})} 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dinnerPortion')}<br/><span className="font-normal text-gray-500">15.000 Ft / 2 fő</span></label>
                            <input 
                               type="number" min="0" max="5" 
                               className="w-full p-2 border rounded-lg outline-none" 
                               value={formData.dinners} 
                               onChange={e => setFormData({...formData, dinners: parseInt(e.target.value) || 0})} 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesLabel')}</label>
                       <textarea 
                          rows="2"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                       ></textarea>
                    </div>

                    {/* FIZETÉSI INFÓK */}
                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-800">{t('totalPrice')}</span>
                        <span className="text-2xl font-serif font-bold text-amber-600">
                          {calculatePrice().toLocaleString('hu-HU')} Ft
                        </span>
                      </div>

                      {selectedRoom.accommodation_name === 'Flamingó Borház' && (
                        <p className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
                          {t('priceNoteFlamingo')}
                        </p>
                      )}

                      <div className="bg-gray-100 p-5 rounded-xl">
                        <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-700">
                          <CreditCard size={18} /> {t('revolutTransfer')}
                        </h4>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* QR Kód Helye */}
                          <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
                             <Image 
                               src="/revolute-qr.jpeg" 
                               alt="Revolut QR" 
                               width={128} 
                               height={128} 
                               className="w-full h-full object-contain"
                             />
                          </div>
                          
                          {/* Adatok */}
                          <div className="text-sm space-y-1 text-gray-600 w-full">
                            <p><span className="font-semibold">Név:</span> Viktoria Toth</p>
                            <p><span className="font-semibold">IBAN:</span> DE38 1001 0178 0098 9166 01</p>
                            <p><span className="font-semibold">Revtag:</span> @viktoriat92</p>
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                               <Info size={14} className="inline mr-1"/>
                               {t('revolutNote')} <strong>{t('revolutNoteBold')}</strong>!
                            </div>
                          </div>
                        </div>

                        {/* Fizetési igazolás input */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('revolutInputLabel')}
                          </label>
                          <input 
                            required type="text" 
                            placeholder={t('revolutInputPlaceholder')}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            value={formData.paymentRef}
                            onChange={e => setFormData({...formData, paymentRef: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" required 
                        className="mt-1 w-4 h-4 text-amber-600"
                        checked={formData.acceptedTerms}
                        onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
                      />
                      <span className="text-sm text-gray-500">
                        {t('acceptTermsPre')} <a href={selectedRoom.accommodation_name === 'Flamingó Borház' ? "https://flamingopanzioesborhaz.hu" : "https://villaetyek.hu/"} target="_blank" className="underline text-amber-600">{t('acceptTermsLink')}</a>{t('acceptTermsPost')}
                      </span>
                    </label>
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedRoom(null)}
                      className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                    >
                      {t('btnCancel')}
                    </button>
                    <button 
                      type="submit"
                      disabled={bookingStatus === 'submitting'}
                      className="px-8 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg shadow hover:shadow-lg hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {bookingStatus === 'submitting' ? t('btnProcessing') : t('btnFinalize')}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Segéd komponens: Kártya
function RoomCard({ room, onSelect, disabled, t }) {
  const isAvailable = room.status === 'available';
  const isPending = room.status === 'pending';
  
  return (
    <div className={`border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full transition-all ${!isAvailable ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
      <div className={`h-2 w-full ${room.accommodation_name.includes('Flamingó') ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-xl font-bold text-gray-800">{room.room_name}</h3>
           <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <Users size={14}/> {room.capacity} {t('capacity')}
           </div>
        </div>
        
        {/* Ár kijelzés logika */}
        <div className="mt-4 space-y-1 text-gray-600 text-sm">
          {room.accommodation_name === 'Villa Chardonnay' ? (
             <>
               <p>{t('oneNightSat')} <span className="font-semibold">{room.price_per_night.toLocaleString()} Ft</span></p>
               <p>{t('twoNightsFriSat')} <span className="font-semibold">{(36000 * 2).toLocaleString()} Ft</span> <span className="text-xs text-emerald-600 font-bold ml-1">{t('discountLabel')}</span></p>
             </>
          ) : (
             <>
               <p>{t('oneNightSat')} <span className="font-semibold">{room.price_1_night.toLocaleString()} Ft</span></p>
               <p>{t('twoNightsFriSat')} <span className="font-semibold">{(room.price_2_nights_per_night * 2).toLocaleString()} Ft</span> <span className="text-xs text-emerald-600 font-bold ml-1">{t('discountLabel')}</span></p>
               <p className="text-xs text-rose-500 pt-1">{t('plusIfa')}</p>
             </>
          )}
        </div>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        {isAvailable ? (
          <button 
            onClick={onSelect}
            disabled={disabled}
            className="w-full py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? t('btnExpired') : t('btnBooking')}
          </button>
        ) : (
          <button disabled className="w-full py-3 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed border">
            {isPending ? t('btnPending') : t('btnBooked')}
          </button>
        )}
      </div>
    </div>
  );
}