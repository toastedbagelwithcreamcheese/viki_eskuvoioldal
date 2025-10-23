// app/admin/layout.js
export const metadata = {
  title: 'Admin',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      {children}
    </div>
  );
}
