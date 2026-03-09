import "./globals.css";
import Providers from "./providers";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Warehouse App",
  description: "Warehouse system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-linear-to-br from-neutral-900 via-neutral-850 to-neutral-900 p-0 md:p-4">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}