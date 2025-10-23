// app/login/layout.js
export const metadata = {
  title: "Bejelentkezés",
};

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 p-6">
      {children}
    </div>
  );
}
