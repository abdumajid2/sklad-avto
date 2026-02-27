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
      <body className=" bg-linear-to-br from-neutral-900 via-neutral-850 to-neutral-900 p-4">
        <Providers>
          <AuthGuard>
            {/* Main container */}
            <div className="relative w-full max-w-800 mx-auto min-h-[calc(100dvh-32px)] h-[calc(100dvh-32px)] rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/bgs.jpg')" }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/40 to-black/50" />

              {/* Blur effect */}
              <div className="absolute inset-0 backdrop-blur-sm" />

              {/* Content wrapper */}
              <div className="relative z-10 flex flex-col h-full">
                <Header />
                <main className="flex-1  overflow-auto px-3 md:px-6 py-4">
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