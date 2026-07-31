import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import { Mail, Type, Star } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa6";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Selected Work (Only photos flagged as is_featured from public galleries)
  const { data: selectedWork } = await supabase
    .from("photos")
    .select("*, galleries(is_public)")
    .eq("is_featured", true)
    .eq("galleries.is_public", true)
    .limit(9);

  const categories = [
    "Lifestyle",
    "Portraits",
    "Events",
    "Graduation",
    "Fashion",
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-slate-100">
      {/* --- 1. MINIMAL NAV --- */}
      <nav className="py-4 md:py-8 flex justify-center bg-white">
        <img
          src="/logo.png"
          alt="Dara Pixel"
          className="h-8 md:h-10 w-auto object-contain"
        />
      </nav>

      {/* --- 2. THE HERO CAROUSEL --- */}
      <section className="px-4 md:px-12">
        <HeroCarousel />
      </section>

      {/* --- 3. CATEGORIES --- */}
      <section className="py-24 border-b border-slate-50 overflow-x-auto whitespace-nowrap px-6 no-scrollbar">
        <div className="max-w-4xl mx-auto flex justify-center gap-12 md:gap-20">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/portfolio?cat=${cat}`}
              className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 hover:text-black transition"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* --- 4. THE ABOUT --- */}
      <section className="max-w-5xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="aspect-[3/4] bg-slate-100 grayscale-[20%] overflow-hidden shadow-2xl">
          <img
            src="/dara-portrait.jpg"
            className="w-full h-full object-cover"
            alt="Dara Portrait"
          />
        </div>
        <div className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-300 font-bold">
            The Storyteller
          </h3>
          <h2 className="text-4xl font-serif italic leading-snug">
            Hi, I'm Dara. I document the poetry of life.
          </h2>
          <p className="text-slate-500 font-light leading-relaxed">
            Based in Lagos, I specialize in lifestyle and editorial photography.
            I'm here to help you remember exactly how a moment felt, not just
            how it looked.
          </p>
          <Link
            href="mailto:hello@darapixel.com"
            className="inline-block border-b border-black pb-1 text-[10px] uppercase tracking-widest font-bold pt-4"
          >
            Let's Connect
          </Link>
        </div>
      </section>

      {/* --- 5. SELECTED WORK --- */}
      <section className="bg-[#fafafa] py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-[10px] uppercase tracking-[0.5em] text-slate-300 font-bold mb-20">
            Selected Work
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {selectedWork && selectedWork.length > 0 ? (
              selectedWork.map((photo) => {
                const publicUrl = supabase.storage
                  .from("galleries")
                  .getPublicUrl(photo.storage_path).data.publicUrl;
                return (
                  <div
                    key={photo.id}
                    className="aspect-square bg-slate-100 overflow-hidden rounded-sm group relative"
                  >
                    <img
                      src={publicUrl}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                      alt="Featured Work"
                    />
                  </div>
                );
              })
            ) : (
              /* Fallback if nothing is starred yet */
              <div className="col-span-full text-center py-20 text-slate-300 italic text-sm">
                Select "Feature" on photos in your dashboard to show them here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- 6. TESTIMONIALS --- */}
      <section className="py-32 text-center max-w-3xl mx-auto px-6">
        <Star className="mx-auto mb-8 text-slate-200" size={32} />
        <p className="text-2xl md:text-3xl font-serif italic text-slate-600 leading-relaxed">
          "Dara has an incredible eye for detail. The session was relaxed and
          the photos are beyond what we imagined."
        </p>
        <span className="block mt-6 text-[10px] uppercase tracking-widest font-bold">
          — Tolu & Ade
        </span>
      </section>

      {/* --- 7. FINAL CTA --- */}
      <section className="py-40 bg-slate-900 text-white text-center">
        <h2 className="text-4xl md:text-6xl font-serif italic mb-10">
          Ready to create?
        </h2>
        <Link
          href="mailto:hello@darapixel.com"
          className="bg-white text-black px-16 py-5 rounded-full text-[10px] uppercase tracking-[0.4em] font-black hover:bg-slate-200 transition"
        >
          Book a Session
        </Link>
      </section>

      {/* --- 8. FOOTER --- */}
      <footer className="py-12 flex flex-col items-center gap-4 bg-white">
        <div className="flex gap-12 text-slate-300">
          <a href="#" className="hover:text-black transition">
            <FaInstagram size={20} />
          </a>
          <a href="#" className="hover:text-black transition">
            <FaTiktok size={20} />
          </a>
        </div>
        <p className="text-[9px] text-slate-200">
          <Link href="/login">©</Link> Dara Pixel 2024
        </p>
      </footer>
    </div>
  );
}
