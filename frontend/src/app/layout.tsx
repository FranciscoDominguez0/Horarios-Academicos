import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Scheduler - Asignación Automática de Horarios",
  description: "Optimización de horarios académicos mediante Algoritmos voraces (Greedy) y Backtracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
