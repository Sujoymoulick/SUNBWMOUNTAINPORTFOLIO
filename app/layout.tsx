import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "./components/LenisProvider";

export const metadata: Metadata = {
  title: "Sujoy Moulick | Kinetic Luminary — Full Stack Developer",
  description:
    "Portfolio of Sujoy Moulick — crafting scalable, high-performance digital experiences with Next.js, React, Node, and AWS.",
  openGraph: {
    title: "Sujoy Moulick | Kinetic Luminary",
    description: "Full Stack Developer crafting cinematic, scalable digital experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
