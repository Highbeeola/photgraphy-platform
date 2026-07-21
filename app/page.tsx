import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  // Get public galleries to show as a "Teaser" on the front page
  const { data: galleries } = await supabase
    .from("galleries")
    .select("*, photos(storage_path)")
    .eq("is_public", true)
    .limit(3);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Simple, Clean Navbar */}
      <nav className="p-6 md:p-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl font-medium tracking-tighter uppercase">
          Lens & Light
        </h1>
        <div className="flex gap-6 text-[10px] uppercase tracking-widest font-bold">
          <Link href="/login" className="hover:opacity-50 transition">
            Client Access
          </Link>
        </div>
      </nav>

      {/* High-Impact Hero (Large but Simple) */}
      <header className="px-6 py-10 md:px-20 md:py-20">
        <div className="max-w-4xl">
          <h2 className="text-4xl md:text-7xl font-serif italic leading-tight text-slate-900">
            Preserving moments <br /> in their purest form.
          </h2>
          <p className="mt-6 text-slate-500 max-w-md leading-relaxed">
            Professional photography for people who value timeless, unscripted
            memories.
          </p>
        </div>
      </header>

      {/* The Portfolio "Grid" - This is what he wants people to see immediately */}
      <main className="px-4 md:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries?.map((gallery) => {
            const coverPhoto = gallery.photos?.[0]?.storage_path;
            const coverUrl = coverPhoto
              ? supabase.storage.from("galleries").getPublicUrl(coverPhoto).data
                  .publicUrl
              : null;

            return (
              <Link
                key={gallery.id}
                href={`/gallery/${gallery.id}`}
                className="group block"
              >
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden rounded-sm relative">
                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition duration-1000 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <h3 className="text-sm font-medium uppercase tracking-widest">
                    {gallery.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    View Collection →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="p-10 text-center border-t border-slate-50">
        <Link
          href="/login"
          className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-black transition"
        >
          Photographer Login
        </Link>
      </footer>
    </div>
  );
}
