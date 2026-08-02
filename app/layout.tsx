import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// 1. Initialize fonts
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Dara Pixel | Fine Art Photography",
    template: "%s | Dara Pixel",
  },
  description:
    "Capturing the raw, unscripted beauty of human connection in Lagos and worldwide.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    // This tells Android where to find the high-res icons
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
    ],
  },
  openGraph: {
    title: "Dara Pixel Photography",
    description: "Lifestyle and editorial photography.",
    url: "https://darapixel.vercel.app",
    siteName: "Dara Pixel",
    images: [{ url: "/logo.png" }],
    type: "website",
  },
};
// 2. Fix the 'any' error by defining the type here
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
