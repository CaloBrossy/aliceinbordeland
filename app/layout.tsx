import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/components/SoundProvider";
import SoundControls from "@/components/SoundControls";
import ParticleBackground from "@/components/ParticleBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alice in Borderland - Multiplayer Game",
  description: "Juego multijugador en tiempo real inspirado en Alice in Borderland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SoundProvider>
          <ParticleBackground particleCount={50} color="#ffffff" opacity={0.3} />
        {children}
          <SoundControls />
        </SoundProvider>
      </body>
    </html>
  );
}
