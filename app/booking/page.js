'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Users, Calendar, Check, X, CreditCard, Info, Clock, Coffee } from 'lucide-react';
import Image from 'next/image';

// Supabase kliens inicializálása
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Form state kiegészítve az új mezőkkel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nights: 1, // Flamingóhoz: 1 vagy 2
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

  // 3. Árkalkuláció (kibővítve)
  const calculatePrice = () => {
    if (!selectedRoom) return 0;
    
    // Villa Chardonnay (fix ár)
    if (selectedRoom.accommodation_name === 'Villa Chardonnay') {
      return selectedRoom.price_per_night;
    }
    
    // Flamingó (dinamikus ár + extrák)
    let total = 0;
    if (formData.nights === 1) {
      total = selectedRoom.price_1_night;
    } else {
      total = selectedRoom.price_2_nights_per_night * 2; // 2 éjszaka ára
    }

    // Extrák hozzáadása (csak a Flamingónál van értelme, de a UI ezt korlátozza)
    if (selectedRoom.accommodation_name === 'Flamingó Borház') {
        total += formData.adults * formData.nights * 600; // IFA (600 Ft/fő/éj)
        total += formData.breakfasts * formData.nights * 5000; // Reggeli (5000 Ft/fő/nap)
        total += formData.dinners * 15000; // Falusi tál (15.000 Ft/tál - ez egyszeri alkalom, nem szorozzuk éjszakával)
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
        setErrorMessage('Sajnos ezt a szobát közben elvitték. Kérjük válassz másikat!');
        setBookingStatus('error');
        fetchRooms(); // Frissítjük a listát
        return;
      }

      const isFlamingo = selectedRoom.accommodation_name === 'Flamingó Borház';

      // 4.2 Foglalás beszúrása (új oszlopokkal)
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
      setErrorMessage('Váratlan hiba történt. Kérlek próbáld újra!');
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
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Szállásfoglalás</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Kérjük, válassz az alábbi elérhető szobák közül. A foglalás véglegesítéséhez
          szükséges az utalás elindítása.
        </p>
        {isExpired && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg inline-block font-bold">
            A foglalási határidő (2026. április 15.) lejárt.
          </div>
        )}
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-6xl space-y-16">
        
        {/* VILLA CHARDONNAY SZEKCIÓ */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Hotel className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl font-serif text-gray-800">Villa Chardonnay</h2>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-gray-600">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Clock size={18}/> Be- és kijelentkezés</h4>
                   <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Bejelentkezés: 15:00-tól</li>
                      <li>Kijelentkezés: 10:00-ig (vasárnap délelőtt)</li>
                      <li>Babaágy / 6 év alatti gyermek: díjmentes</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Coffee size={18}/> Étkezés</h4>
                   <p className="text-sm">Reggelire sajnos nincs lehetőség, de a vendégek használhatják a teljesen felszerelt közös konyhát önellátásra.</p>
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
              />
            ))}
            {villaRooms.length === 0 && !loading && <p>Nincs megjeleníthető szoba.</p>}
          </div>
        </div>

        {/* FLAMINGÓ BORHÁZ SZEKCIÓ */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Hotel className="w-8 h-8 text-rose-600" />
            <h2 className="text-3xl font-serif text-gray-800">Flamingó Borház</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-gray-600">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Clock size={18}/> Infók</h4>
                   <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Bejelentkezés: 15:00-tól (Korábbi érkezés 1.000 Ft/fő/óra, előzetes egyeztetéssel)</li>
                      <li>Kijelentkezés: 10:00-ig (Késői távozás 1.000 Ft/óra, max. 14:00-ig, előzetes egyeztetéssel)</li>
                      <li>Wellness használat (szauna, pezsgőfürdő) minden nap 22:00-ig ingyenes</li>
                      <li>Idegenforgalmi adó: 600 Ft/fő/éj (18 év felett)</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Coffee size={18}/> Étkezés (opcionális)</h4>
                   <p className="text-sm mb-2">Büféreggeli (min. 6 főtől): 5.000 Ft/fő/nap.</p>
                   <p className="text-sm">Vacsora (Falusi tál 2 főre): 15.000 Ft.</p>
                   <p className="text-xs text-gray-500 mt-2">Állandó éttermük nincs, ételeik előzetes egyeztetés alapján készülnek.</p>
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
                  <h3 className="text-3xl font-serif text-green-800 mb-4">Foglalás elküldve!</h3>
                  <p className="text-gray-600 mb-8">
                    Köszönjük! A foglalásod "Függőben" státuszba került. Amint ellenőriztük az utalást, véglegesítjük a foglalást, melyről e-mailt küldünk (ha megadtad).
                  </p>
                  <button 
                    onClick={() => { setSelectedRoom(null); setBookingStatus('idle'); }}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Rendben, bezárás
                  </button>
                </div>
              ) : (
                // FOGLALÁSI ŰRLAP
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  <div className="p-6 md:p-8 border-b bg-gray-50">
                    <h3 className="text-2xl font-serif text-gray-800 mb-1">Foglalás véglegesítése</h3>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teljes név</label>
                        <input 
                          required type="text" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email cím (opcionális)</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Flamingó speciális dátumválasztó és extrák */}
                    {selectedRoom.accommodation_name === 'Flamingó Borház' && (
                      <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 space-y-5">
                        <h4 className="font-bold text-rose-900 border-b border-rose-200 pb-2">Részletek és Extrák</h4>
                        
                        <div>
                          <label className="block text-sm font-semibold text-rose-800 mb-2">Hány éjszakára maradtok?</label>
                          <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer p-3 rounded-lg border-2 text-center transition ${formData.nights === 1 ? 'border-rose-500 bg-white' : 'border-transparent bg-white/50'}`}>
                              <input 
                                type="radio" name="nights" className="hidden" 
                                checked={formData.nights === 1}
                                onChange={() => setFormData({...formData, nights: 1})}
                              />
                              <span className="block font-bold text-gray-800">1 Éjszaka</span>
                              <span className="text-xs text-gray-500">Csak Szombat</span>
                            </label>
                            <label className={`cursor-pointer p-3 rounded-lg border-2 text-center transition ${formData.nights === 2 ? 'border-rose-500 bg-white' : 'border-transparent bg-white/50'}`}>
                              <input 
                                type="radio" name="nights" className="hidden" 
                                checked={formData.nights === 2}
                                onChange={() => setFormData({...formData, nights: 2})}
                              />
                              <span className="block font-bold text-gray-800">2 Éjszaka</span>
                              <span className="text-xs text-gray-500">Péntek + Szombat</span>
                            </label>
                          </div>
                        </div>

                        {/* ÚJ: IFA, Reggeli, Vacsora bekérése */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Felnőttek (IFA)<br/><span className="font-normal text-gray-500">600 Ft/fő/éj</span></label>
                            <input 
                               type="number" min="1" max={selectedRoom.capacity} 
                               className="w-full p-2 border rounded-lg outline-none" 
                               value={formData.adults} 
                               onChange={e => setFormData({...formData, adults: parseInt(e.target.value) || 1})} 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Reggeli (Fő)<br/><span className="font-normal text-gray-500">5.000 Ft/fő/nap</span></label>
                            <input 
                               type="number" min="0" max="10" 
                               className="w-full p-2 border rounded-lg outline-none" 
                               value={formData.breakfasts} 
                               onChange={e => setFormData({...formData, breakfasts: parseInt(e.target.value) || 0})} 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Falusi tál (Db)<br/><span className="font-normal text-gray-500">15.000 Ft / 2 fő</span></label>
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
                       <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés (Masszázs igény, korai/késői érkezés, stb.)</label>
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
                        <span className="text-lg font-bold text-gray-800">Fizetendő összeg:</span>
                        <span className="text-2xl font-serif font-bold text-amber-600">
                          {calculatePrice().toLocaleString('hu-HU')} Ft
                        </span>
                      </div>

                      {selectedRoom.accommodation_name === 'Flamingó Borház' && (
                        <p className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
                          Az ár tartalmazza a szoba, az IFA és a kért étkezések díját. A helyszínen esetlegesen felmerülő extra fogyasztás (italok, masszázs) a panzióban fizetendő. A Panzióban nincs főzési lehetőség, a behozott alkoholos italokért 650 Ft/palack szervízdíjat számolnak fel.
                        </p>
                      )}

                      <div className="bg-gray-100 p-5 rounded-xl">
                        <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-700">
                          <CreditCard size={18} /> Revolut utalás
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
                               Kérlek a közleménybe írd be a <strong>nevedet</strong>!
                            </div>
                          </div>
                        </div>

                        {/* Fizetési igazolás input */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Revolut neved vagy Tranzakció Azonosító
                          </label>
                          <input 
                            required type="text" 
                            placeholder="Pl. Gipsz Jakab vagy #123456"
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
                        Elfogadom a <a href={selectedRoom.accommodation_name === 'Flamingó Borház' ? "https://flamingopanzioesborhaz.hu" : "https://villaetyek.hu/"} target="_blank" className="underline text-amber-600">házirendet</a>, és tudomásul veszem, hogy a foglalás csak az utalás beérkezése után válik véglegessé.
                      </span>
                    </label>
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedRoom(null)}
                      className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                    >
                      Mégse
                    </button>
                    <button 
                      type="submit"
                      disabled={bookingStatus === 'submitting'}
                      className="px-8 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg shadow hover:shadow-lg hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {bookingStatus === 'submitting' ? 'Feldolgozás...' : 'Foglalás Véglegesítése'}
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
function RoomCard({ room, onSelect, disabled }) {
  const isAvailable = room.status === 'available';
  const isPending = room.status === 'pending';
  
  return (
    <div className={`border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full transition-all ${!isAvailable ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
      <div className={`h-2 w-full ${room.accommodation_name.includes('Flamingó') ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-xl font-bold text-gray-800">{room.room_name}</h3>
           <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <Users size={14}/> {room.capacity} fő
           </div>
        </div>
        
        {/* Ár kijelzés logika */}
        <div className="mt-4 space-y-1 text-gray-600 text-sm">
          {room.accommodation_name === 'Villa Chardonnay' ? (
             <p className="font-semibold">{room.price_per_night.toLocaleString()} Ft / éj</p>
          ) : (
             <>
               <p>1 éj (Szombat): <span className="font-semibold">{room.price_1_night.toLocaleString()} Ft</span></p>
               <p>2 éj (P+Sz): <span className="font-semibold">{(room.price_2_nights_per_night * 2).toLocaleString()} Ft</span></p>
               <p className="text-xs text-rose-500 pt-1">+ IFA és kért extrák</p>
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
            {disabled ? 'Lejárt' : 'Foglalás'}
          </button>
        ) : (
          <button disabled className="w-full py-3 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed border">
            {isPending ? 'Függőben...' : 'Lefoglalva'}
          </button>
        )}
      </div>
    </div>
  );
}