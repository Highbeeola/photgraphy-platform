export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import HeroCarousel from "@/components/HeroCarousel";
import { Mail, ArrowRight, Star } from "lucide-react";
import { FaInstagram, FaTiktok, FaSnapchat, FaWhatsapp } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch role from 'users' table if user exists
  let isPhotographer = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    isPhotographer = profile?.role === "photographer";
  }

  // 1. Fetch Carousel Images (using the is_hero logic)
  const { data: heroPhotos, error: heroError } = await supabase
    .from("photos")
    .select("*, galleries!inner(is_public)")
    .eq("is_hero", true)
    .eq("galleries.is_public", true);

  // 2. Fetch Selection Grid (using the is_featured logic)
  const { data: featuredPhotos, error: featError } = await supabase
    .from("photos")
    .select("*, galleries!inner(is_public)")
    .eq("is_featured", true)
    .eq("galleries.is_public", true)
    .limit(9);

  // LOG TO TERMINAL TO SEE IF IT'S WORKING
  console.log("Carousel Photos found:", heroPhotos?.length);

  // Transform for Carousel
  const heroImages =
    heroPhotos?.map((p) => ({
      url: supabase.storage.from("galleries").getPublicUrl(p.storage_path).data
        .publicUrl,
    })) || [];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-slate-100">
      {/* --- 1. NAV (Logo Only) --- */}
      <nav className="py-6 md:py-10 flex justify-center bg-white">
        <img
          src="/logo.png"
          alt="Dara Pixel"
          className="h-8 md:h-12 w-auto object-contain"
        />
      </nav>

      {/* --- 2. DYNAMIC HERO CAROUSEL --- */}
      <section className="px-4 md:px-12">
        <HeroCarousel photos={heroImages} />
      </section>

      {/* --- 3. THE ABOUT SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 py-32 md:py-48 grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-center">
        <div className="md:col-span-5 order-2 md:order-1">
          <div className="aspect-[3/4] bg-slate-100 grayscale-[10%] overflow-hidden shadow-2xl rounded-sm">
            <img
              src="/dara-portrait.jpg"
              alt="Dara"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-7 space-y-8 order-1 md:order-2">
          <span className="text-[10px] uppercase tracking-[0.5em] text-slate-300 font-bold">
            The Storyteller
          </span>
          <h2 className="text-4xl md:text-7xl font-serif italic leading-tight tracking-tighter">
            Hi, I'm Dara. <br /> I document the poetry <br /> of human
            connection.
          </h2>
          <p className="text-slate-500 font-light text-lg md:text-xl leading-relaxed max-w-lg">
            Based in Lagos, I specialize in lifestyle and editorial photography.
            I'm here to help you remember exactly how a moment felt, not just
            how it looked.
          </p>
          <div className="pt-6">
            <Link
              href="/portfolio"
              className="bg-black text-white px-14 py-5 rounded-full text-[10px] uppercase tracking-[0.4em] font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95 inline-block"
            >
              Explore All Work
            </Link>
          </div>
        </div>
      </section>

      {/* --- 4. SELECTED WORK GRID --- */}
      <section className="bg-[#fafafa] py-32 md:py-48 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-20 text-center space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.6em] text-slate-300 font-bold">
              Selected Moments
            </h3>
            <div className="w-12 h-[1px] bg-slate-200 mx-auto" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* We use a Map to ensure we only show unique storage paths */}
            {Array.from(
              new Map(
                featuredPhotos?.map((item) => [item.storage_path, item]),
              ).values(),
            ).map((photo: any) => {
              const url = supabase.storage
                .from("galleries")
                .getPublicUrl(photo.storage_path).data.publicUrl;
              return (
                <div
                  key={photo.id}
                  className="aspect-[4/5] bg-white overflow-hidden shadow-sm group"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition duration-700 group-hover:scale-105"
                    alt="Featured"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 5. THE DARK CTA SECTION --- */}
      <section className="py-40 bg-[#0f172a] text-white text-center px-6">
        <h2 className="text-4xl md:text-6xl font-serif italic mb-12 tracking-tight">
          Ready to create?
        </h2>
        <a
          href="https://wa.me/2347072830957?text=Hi%20Dara,%20I%20saw%20your%20portfolio%20and%20I'd%20like%20to%20book%20a%20session!"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-black px-16 py-5 rounded-full text-[10px] uppercase tracking-[0.4em] font-black hover:bg-slate-200 transition active:scale-95 shadow-2xl"
        >
          <FaWhatsapp size={16} />
          Book via WhatsApp
        </a>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer className="py-20 flex flex-col items-center gap-10 bg-white">
        <div className="flex flex-wrap justify-center gap-10 md:gap-12 text-slate-300 px-6">
          {/* <a
            href="https://instagram.com/..."
            target="_blank"
            className="hover:text-black transition"
          >
            <FaInstagram size={22} />
          </a> */}
          <a
            href="https://www.tiktok.com/@dara.pixel1?_r=1&_t=ZS-98XuQErCwIU"
            target="_blank"
            className="hover:text-black transition"
          >
            <FaTiktok size={22} />
          </a>
          <a
            href="https://snapchat.com/t/Dz1au16A"
            target="_blank"
            className="hover:text-yellow-400 transition"
          >
            <FaSnapchat size={22} />
          </a>
          <a
            href="mailto:khalidabdul2023i@gmail.com"
            className="hover:text-red-500 transition"
          >
            <SiGmail size={22} />
          </a>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.5em] font-medium text-center">
            <Link
              href={user ? (isPhotographer ? "/admin" : "/portal") : "/login"}
              className="hover:text-slate-500 transition"
            >
              ©
            </Link>{" "}
            Dara Pixel 2024
          </p>
          {user && (
            <form action={signOut}>
              <button
                type="submit"
                className="text-[9px] uppercase tracking-widest text-red-300 hover:text-red-500 transition"
              >
                Sign Out
              </button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
}
