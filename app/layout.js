// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Viki Esküvői Oldal',
  description: 'Esküvői meghívó és admin felület',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
