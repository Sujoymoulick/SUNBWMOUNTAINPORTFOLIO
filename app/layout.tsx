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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
