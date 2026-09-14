import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Цифровая логистика — мастер-класс по 1С:TMS",
  description:
    "Интерактивная пошаговая презентация мастер-класса по созданию рейса и маршрутного листа в 1С:TMS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
