import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import SmartImage from "@/components/SmartImage"; // 1. Import SmartImage

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortfolioPage() {
  noStore();

  const supabase = await createClient();

  const { data: galleries } = await supabase
    .from("galleries")
    .select(`*, photos (storage_path)`)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const categories = Array.from(
    new Set(galleries?.map((g) => g.category).filter(Boolean)),
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <nav className="p-8 md:p-12 flex justify-center">
        <Link
          href="/"
          className="text-xl font-serif italic tracking-tighter uppercase font-bold"
        >
          Dara Pixel
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 space-y-24 py-12">
        <header className="text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light">
            The Collections
          </h1>
          <div className="w-12 h-[1px] bg-slate-300 mx-auto mt-8" />
        </header>

        {categories.map((cat) => {
          const catGalleries = galleries?.filter((g) => g.category === cat);
          if (!catGalleries || catGalleries.length === 0) return null;

          return (
            <section key={cat} id={cat.toLowerCase().replace(/\s+/g, "-")}>
              <h2 className="text-xs md:text-sm uppercase tracking-[0.6em] text-slate-900 font-black mb-10 text-center">
                {cat}s
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
                {catGalleries.map((gallery) => {
                  const coverPath =
                    gallery.cover_image_path ||
                    gallery.photos?.[0]?.storage_path;

                  const coverUrl = coverPath
                    ? coverPath.startsWith("http")
                      ? coverPath
                      : supabase.storage
                          .from("galleries")
                          .getPublicUrl(coverPath).data.publicUrl
                    : null;

                  return (
                    <Link
                      key={gallery.id}
                      href={`/gallery/${gallery.slug}`}
                      className="group block space-y-4 cursor-pointer"
                    >
                      {/* 2. REPLACED <img> WITH <SmartImage> */}
                      <div className="w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                        {coverUrl && (
                          <SmartImage
                            src={coverUrl}
                            alt={gallery.title}
                            width={1000}
                          />
                        )}
                      </div>

                      <div className="text-center space-y-1">
                        <h3 className="text-2xl font-serif italic group-hover:text-slate-600 transition">
                          {gallery.title}
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
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
            </section>
          );
        })}
      </main>
    </div>
  );
}
