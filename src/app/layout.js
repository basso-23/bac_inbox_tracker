import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fontsource-variable/inter";

export const metadata = {
  title: "BAC | Inbox Tracker",
  description: "Visitar sitio web",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
