import type { Metadata } from "next"; // This fixes the 'Metadata' error
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lens & Light | Professional Gallery",
  description: "Private client galleries and photography portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
