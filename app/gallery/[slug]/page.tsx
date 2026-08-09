import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import GalleryClientView from "@/components/GalleryClientView";

export const dynamic = "force-dynamic";

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Gallery by slug
  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!gallery) notFound();

  // 2. Fetch Photos using gallery.id
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", gallery.id)
    .order("created_at", { ascending: true });

  // 3. SMART URL RESOLUTION
  const photos =
    photosData?.map((p) => {
      const url = p.storage_path.startsWith("http")
        ? p.storage_path
        : supabase.storage.from("galleries").getPublicUrl(p.storage_path).data
            .publicUrl;

      return {
        ...p,
        url: url,
      };
    }) || [];

  // 4. Fetch User & Favorites
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favorites } = user
    ? await supabase
        .from("favorites")
        .select("photo_id")
        .eq("client_id", user.id)
    : { data: [] };

  // 5. SMART COVER RESOLUTION
  let coverUrl = gallery.cover_image_path;
  if (coverUrl) {
    if (!coverUrl.startsWith("http")) {
      coverUrl = supabase.storage.from("galleries").getPublicUrl(coverUrl)
        .data.publicUrl;
    }
  } else {
    coverUrl = photos[0]?.url;
  }

  // 6. INCREMENT VIEW COUNT
  if (gallery && !user) {
    await supabase.rpc("increment_gallery_views", { gallery_id: gallery.id });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* --- THE CINEMATIC HERO --- */}
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden flex items-center justify-center bg-slate-900">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={gallery.title}
            fill
            priority
            className="object-cover object-top opacity-60 animate-reveal"
          />
        )}

        {/* Hero Text Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-20 z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="space-y-2">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] text-white/70 font-bold">
              Captured in{" "}
              {gallery.event_date
                ? new Date(gallery.event_date).getFullYear()
                : "2026"}
            </p>
            <h1 className="text-5xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-none">
              {gallery.title}
            </h1>
          </div>

          <a
            href="#grid"
            className="px-10 py-4 border border-white/40 text-white text-[10px] uppercase tracking-widest font-black hover:bg-white hover:text-black transition-all backdrop-blur-md"
          >
            View Gallery
          </a>
        </div>
      </section>

      {/* --- THE GRID & CLIENT CONTROLS AREA --- */}
      <div id="grid" className="pb-20">
        {photos.length > 0 ? (
          <GalleryClientView
            gallery={gallery}
            photos={photos}
            initialFavorites={favorites || []}
            user={user}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center text-slate-300 italic font-serif">
            This collection is being curated. Check back soon.
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="py-32 flex flex-col items-center gap-6 border-t border-slate-50 bg-[#fafafa]">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-12 w-auto grayscale opacity-50"
        />
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300 font-bold">
          © Dara Pixel Studio
        </p>
      </footer>
    </div>
  );
}
