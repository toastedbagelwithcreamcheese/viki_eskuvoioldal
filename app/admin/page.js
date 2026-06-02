import { createClient } from '@supabase/supabase-js';
import ImageManager from '../../components/ImageManager';
import MessageManager from '../../components/MessageManager';
import BookingManager from '../../components/BookingManager'; // ÚJ IMPORT
import DownloadAllImages from '../../components/DownloadAllImages';

export default async function RsvpAdminPage({ searchParams }) {
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

  // 🔸 Adatok lekérése (Kiegészítve a bookings táblával)
  const { data: rsvps, error: rsvpsError } = await supabase
    .from('rsvps')
    .select('*, guests(*)')
    .order('created_at', { ascending: false });

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  // Szállásfoglalások lekérése (hozzárakjuk a rooms tábla adatait is)
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*, rooms(*)')
    .order('created_at', { ascending: false });

  if (rsvpsError || messagesError || bookingsError)
    return <p className="text-center mt-8 text-red-600">Hiba a betöltés közben.</p>;

  // 🧮 Összesített statisztikák (RSVP)
  const attendingGuests = rsvps.flatMap(r => (r.is_attending ? r.guests : []));
  const notAttendingGuests = rsvps.flatMap(r => (!r.is_attending ? r.guests : []));
  const notAttendingGroupsCount = rsvps.filter(r => !r.is_attending && r.guests.length === 0).length;

  const totalAttending = attendingGuests.length;
  const totalNotAttending = notAttendingGuests.length + notAttendingGroupsCount; 
  const totalTransfer = attendingGuests.filter(g => g.needs_transfer).length;
  const totalAccommodation = attendingGuests.filter(g => g.needs_accommodation).length;

  // 🧮 Szállás statisztikák
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const approvedBookingsCount = bookings.filter(b => b.status === 'approved').length;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif mb-6">Admin Felület</h1>
        
        
        {/* Összesítő kártyák (RSVP) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <p className="font-semibold text-amber-800">Szállást kér (RSVP alapján):</p>
            <p className="text-3xl font-bold text-amber-900">{totalAccommodation}</p>
          </div>
        </div>

        {/* ÚJ: Összesítő kártyák (Szállásfoglalások) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-200">
             <p className="font-semibold text-yellow-800">Függőben lévő foglalások:</p>
             <p className="text-3xl font-bold text-yellow-900">{pendingBookingsCount}</p>
           </div>
           <div className="p-4 bg-green-100 rounded-lg border border-green-200">
             <p className="font-semibold text-green-800">Jóváhagyott (Kifizetett) szobák:</p>
             <p className="text-3xl font-bold text-green-900">{approvedBookingsCount}</p>
           </div>
        </div>
      </div>

      {/* ÚJ: Szállásfoglalások szekció */}
      <div>
        <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
          Szállásfoglalások Kezelése
        </h2>
        <BookingManager initialBookings={bookings} />
      </div>

      {/* RSVP lista */}
      <div>
        <h2 className="text-2xl font-serif mb-4">RSVP Részletes Lista</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                if (rsvp.guests && rsvp.guests.length > 0) {
                  return rsvp.guests.map(guest => (
                    <tr 
                      key={guest.id} 
                      className={`border-b ${rsvp.is_attending ? 'hover:bg-gray-50' : 'bg-rose-50 hover:bg-rose-100 text-rose-900'}`}
                    >
                      <td className="px-6 py-4 font-medium">{guest.name}</td>
                      <td className="px-6 py-4 text-center">
                        {rsvp.is_attending ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Jön</span>
                        ) : (
                          <span className="px-2 py-1 bg-rose-200 text-rose-800 rounded-full text-xs">Nem jön</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rsvp.is_attending ? (guest.needs_transfer ? '✅' : '❌') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rsvp.is_attending ? (guest.needs_accommodation ? '✅' : '❌') : '-'}
                      </td>
                      <td className="px-6 py-4">{guest.notes || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(rsvp.created_at).toLocaleString('hu-HU')}
                      </td>
                    </tr>
                  ));
                } 
                else if (!rsvp.is_attending) {
                  return (
                    <tr key={rsvp.id} className="border-b bg-rose-50 hover:bg-rose-100">
                      <td className="px-6 py-4 text-rose-700 italic font-medium">Név nélküli lemondás</td>
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
                  <td colSpan="6" className="text-center p-8 text-gray-500">Még nem érkezett visszajelzés.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Képek és Üzenetek kezelése */}
<div className="grid md:grid-cols-2 gap-8">
  <div>
     <div className="flex items-center justify-between mt-8 mb-4">
       <h2 className="text-2xl font-serif">Galéria Kezelése</h2>
       {/* ITT VAN AZ ÚJ GOMB */}
       <DownloadAllImages />
     </div>
     <ImageManager />
  </div>
  <div>
     <h2 className="text-2xl font-serif mt-8 mb-4">Beérkezett Üzenetek</h2>
     <MessageManager messages={messages} />
  </div>
</div>

      

    </div>
  );
}