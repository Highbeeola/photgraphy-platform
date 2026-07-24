import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortfolioPage() {
  const supabase = await createClient();

  // Fetch only public galleries
  const { data: galleries } = await supabase
    .from("galleries")
    .select(`*, photos (storage_path)`)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <nav className="p-12 flex justify-center">
        <Link
          href="/"
          className="text-xl font-serif italic tracking-tighter uppercase"
        >
          Dara Pixel
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light">
            The Collections
          </h1>
          <div className="w-12 h-[1px] bg-slate-300 mx-auto mt-8" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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
                className="group space-y-6"
              >
                <div className="aspect-[3/2] overflow-hidden bg-slate-200 shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif italic">
                    {gallery.title}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">
                    {gallery.event_date
                      ? new Date(gallery.event_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long" },
                        )
                      : "Editorial"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
