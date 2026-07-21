import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-200">
      {/* 1. MINIMAL NAVIGATION */}
      <nav className="p-8 md:p-12 flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-serif italic tracking-tighter text-center">
          Dara Pixel
        </h1>
        <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
          <Link href="/portfolio" className="hover:text-black transition">
            Portfolio
          </Link>
          <Link href="/login" className="hover:text-black transition">
            {user ? "Dashboard" : "Client Login"}
          </Link>
        </div>
      </nav>

      {/* 2. EDITORIAL HERO SECTION */}
      <main className="max-w-screen-xl mx-auto px-6 pb-24">
        <div className="flex flex-col items-center">
          {/* Framed Image - Vertical works best for Jose Villa style */}
          <div className="w-full md:w-[60%] lg:w-[45%] aspect-[2/3] bg-slate-100 relative group overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069"
              alt="Editorial Photography"
              className="w-full h-full object-cover grayscale-[20%] transition duration-[2s] group-hover:scale-105"
            />
            {/* Soft border inside the image to make it look like a physical print */}
            <div className="absolute inset-4 border border-white/20 pointer-events-none" />
          </div>

          {/* Copy - High letter spacing, serif font */}
          <div className="mt-16 text-center max-w-2xl space-y-8">
            <h2 className="text-4xl md:text-7xl font-serif leading-[1.1] font-light">
              Fine Art <br />
              <span className="italic">Wedding Photography</span>
            </h2>

            <p className="text-slate-500 font-light text-sm md:text-base leading-relaxed tracking-wide px-4">
              Capturing the raw, unscripted elegance of your most cherished
              days. Based in the city, available worldwide.
            </p>

            {/* BUTTONS THAT FEEL LIKE BUTTONS */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
              <Link
                href={user ? "/admin" : "/login"}
                className="w-full md:w-auto px-12 py-4 border border-slate-900 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-slate-900 hover:text-white transition-all duration-500 active:scale-95 text-center"
              >
                {user ? "Enter Dashboard" : "View Collections"}
              </Link>

              {!user && (
                <Link
                  href="/login"
                  className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white text-[10px] uppercase tracking-[0.3em] font-black hover:bg-slate-700 transition-all duration-500 active:scale-95 text-center"
                >
                  Photographer Access
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-slate-100 flex flex-col items-center gap-4">
        <span className="text-[10px] uppercase tracking-[0.5em] text-slate-300">
          Est. 2024
        </span>
        <p className="text-xs font-serif italic text-slate-400">
          Copyright © Dara Pixel Studio
        </p>
      </footer>
    </div>
  );
}
