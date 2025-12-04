import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Onest } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import CustomCursor from "@/app/components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirilab",
  description: "Mirilab Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical assets for better LCP */}
        <link rel="preload" href="/v1img.jpg" as="image" fetchPriority="high" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${onest.variable} antialiased bg-black text-white`}
      >
        <CustomCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
