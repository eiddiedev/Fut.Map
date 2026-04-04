import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const displayFont = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800"]
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"]
});

const heroFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["500", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Fut.Map",
  description: "Fut.Map is a cinematic football atlas that transitions from a bold landing scene into a 3D world of national teams and club maps."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${displayFont.variable} ${monoFont.variable} ${heroFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
