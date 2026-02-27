import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Providers from "./providers";
import AuthGuard from "../components/AuthGuard";

export const metadata = {
  title: "Warehouse App",
  description: "Warehouse system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-linear-to-br from-neutral-900 via-neutral-850 to-neutral-900 p-0 md:p-4">
        <Providers>
          <AuthGuard>
            <div className="relative w-full h-[100dvh] md:h-[calc(100dvh-32px)] md:rounded-2xl overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/bgs.jpg')" }}
              />
              <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/40 to-black/50" />
              <div className="absolute inset-0 backdrop-blur-sm" />

              <div className="relative z-10 flex flex-col h-full">
                <Header />
                <main className="flex-1 overflow-auto px-3 md:px-6 py-4">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}