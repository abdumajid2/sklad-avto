import "./globals.css";
import Footer from "../components/Footer";
import Providers from "./providers";

export const metadata = {
  title: "Warehouse App",
  description: "Warehouse system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-800 flex items-center justify-center p-4">

        {/* Карточка (внутри будут Header/Main/Footer) */}
        <div className="relative w-full max-w-[1600px] h-[800px] rounded-2xl overflow-hidden shadow-2xl">

          {/* Фон картинка */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/bgs.jpg')" }}
          />

          {/* Затемнение */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Размытие */}
          <div className="absolute inset-0 backdrop-blur-md" />

          {/* Контент */}
          <div className="relative z-10 h-full flex flex-col text-white">
          

            <main className="flex-1 overflow-auto p-6">

              <Providers>{children}</Providers>
            </main>

            <Footer />
          </div>

        </div>
      </body>
    </html>
  );
}