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
      <body className="p-5">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}