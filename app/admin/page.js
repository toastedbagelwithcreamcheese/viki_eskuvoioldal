import { createClient } from '@supabase/supabase-js';
import ImageManager from '../../components/ImageManager';
import MessageManager from '../../components/MessageManager';

export default async function RsvpAdminPage({ searchParams }) {
  // 🔹 Megvárjuk, amíg a searchParams elérhető lesz
  const params = await searchParams;

  const adminPassword = process.env.ADMIN_PASSWORD;

  // 🔐 Egyszerű jelszóellenőrzés
  if (params.password !== adminPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold">Hozzáférés megtagadva</h1>
        </div>
      </div>
    );
  }

  // 🔗 Supabase kapcsolat
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 🔸 Adatok lekérése
  const { data: rsvps, error: rsvpsError } = await supabase
    .from('rsvps')
    .select('*, guests(*)')
    .order('created_at', { ascending: false });

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (rsvpsError || messagesError)
    return <p className="text-center mt-8 text-red-600">Hiba a betöltés közben.</p>;

  // 🧮 Összesített statisztikák
  
  // Jönnek
  const attendingGuests = rsvps.flatMap(r => (r.is_attending ? r.guests : []));
  // Nem jönnek (de megadtak nevet)
  const notAttendingGuests = rsvps.flatMap(r => (!r.is_attending ? r.guests : []));
  // Nem jönnek (régi típusú, név nélküli "csoport" bejegyzések)
  const notAttendingGroupsCount = rsvps.filter(r => !r.is_attending && r.guests.length === 0).length;

  const totalAttending = attendingGuests.length;
  // Összes nem jövő = a névvel rendelkezők + a név nélküli csoportok (itt 1 főnek számoljuk a csoportot becslésként, vagy ahogy szeretnéd)
  const totalNotAttending = notAttendingGuests.length + notAttendingGroupsCount; 
  
  const totalTransfer = attendingGuests.filter(g => g.needs_transfer).length;
  const totalAccommodation = attendingGuests.filter(g => g.needs_accommodation).length;

  // 📊 Megjelenítés
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-serif mb-6">Admin Felület</h1>

      {/* Összesítő kártyák */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-emerald-100 rounded-lg">
          <p className="font-semibold text-emerald-800">Várható vendégek:</p>
          <p className="text-3xl font-bold text-emerald-900">{totalAttending}</p>
        </div>
        <div className="p-4 bg-rose-100 rounded-lg">
          <p className="font-semibold text-rose-800">Nem jön (fő):</p>
          <p className="text-3xl font-bold text-rose-900">{totalNotAttending}</p>
        </div>
        <div className="p-4 bg-sky-100 rounded-lg">
          <p className="font-semibold text-sky-800">Transzfert kér:</p>
          <p className="text-3xl font-bold text-sky-900">{totalTransfer}</p>
        </div>
        <div className="p-4 bg-amber-100 rounded-lg">
          <p className="font-semibold text-amber-800">Szállást kér:</p>
          <p className="text-3xl font-bold text-amber-900">{totalAccommodation}</p>
        </div>
      </div>

      {/* Képek kezelése */}
      <div className="mb-12">
        <ImageManager />
      </div>

      {/* RSVP lista */}
      <h2 className="text-2xl font-serif mt-8 mb-4">RSVP Részletes Lista</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-12">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-semibold">Név</th>
              <th className="px-6 py-4 font-semibold text-center">Státusz</th>
              <th className="px-6 py-4 font-semibold text-center">Transzfer</th>
              <th className="px-6 py-4 font-semibold text-center">Szállás</th>
              <th className="px-6 py-4 font-semibold">Megjegyzés</th>
              <th className="px-6 py-4 font-semibold">Időpont</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map(rsvp => {
              // Ha vannak vendégnevek (akár jönnek, akár nem)
              if (rsvp.guests && rsvp.guests.length > 0) {
                return rsvp.guests.map(guest => (
                  <tr 
                    key={guest.id} 
                    className={`border-b ${rsvp.is_attending ? 'hover:bg-gray-50' : 'bg-rose-50 hover:bg-rose-100 text-rose-900'}`}
                  >
                    <td className="px-6 py-4 font-medium">
                      {guest.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {rsvp.is_attending ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Jön</span>
                      ) : (
                        <span className="px-2 py-1 bg-rose-200 text-rose-800 rounded-full text-xs">Nem jön</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Ha nem jön, nincs értelme transzfert mutatni */}
                      {rsvp.is_attending ? (guest.needs_transfer ? '✅' : '❌') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {/* Ha nem jön, nincs értelme szállást mutatni */}
                      {rsvp.is_attending ? (guest.needs_accommodation ? '✅' : '❌') : '-'}
                    </td>
                    <td className="px-6 py-4">{guest.notes || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(rsvp.created_at).toLocaleString('hu-HU')}
                    </td>
                  </tr>
                ));
              } 
              
              // Ha NINCSENEK vendégnevek, de az RSVP 'Nem jön' (Régi adatok kompatibilitása)
              else if (!rsvp.is_attending) {
                return (
                  <tr key={rsvp.id} className="border-b bg-rose-50 hover:bg-rose-100">
                    <td className="px-6 py-4 text-rose-700 italic font-medium">
                      Név nélküli lemondás
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-rose-200 text-rose-800 rounded-full text-xs">Nem jön</span>
                    </td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4">-</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(rsvp.created_at).toLocaleString('hu-HU')}
                    </td>
                  </tr>
                );
              }
              return null;
            })}
            
            {rsvps.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">
                  Még nem érkezett visszajelzés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Üzenetek szekció */}
      <h2 className="text-2xl font-serif mt-8 mb-4">Beérkezett Üzenetek</h2>
      <MessageManager messages={messages} />
    </div>
  );
}