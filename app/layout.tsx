import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arena Versus",
  description: "Plataforma de torneos esports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
