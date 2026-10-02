import type { Metadata, Viewport } from "next";
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

// 2. Viewport Config
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// 3. Metadata Config
export const metadata: Metadata = {
  title: {
    default: "Dara Pixel | Fine Art Photography",
    template: "%s | Dara Pixel",
  },
  description:
    "Capturing the raw, unscripted beauty of human connection in Lagos and worldwide.",
  appleWebApp: {
    title: "Dara Pixel",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", media: "(prefers-color-scheme: light)" },
      { url: "/favicon.ico", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
    images: [
      {
        url: "https://orcxzxbkciebsifelctj.supabase.co/storage/v1/object/public/galleries/ChatGPT%20Image%20Aug%202,%202026%20at%2002_43_18%20PM.png",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className={`${serif.variable} ${sans.variable} antialiased`}>
        <div className="animate-in fade-in duration-1000 ease-in-out">
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
