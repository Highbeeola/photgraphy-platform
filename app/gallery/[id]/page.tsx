import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import GalleryClientView from "@/components/GalleryClientView";

export const dynamic = "force-dynamic"; // Kill the cache

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Gallery
  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  // 2. Fetch Photos
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id)
    .order("created_at", { ascending: true });

  // 3. SMART URL RESOLUTION
  const photos =
    photosData?.map((p) => {
      let finalUrl = p.storage_path;

      if (!p.storage_path.startsWith("http")) {
        finalUrl = supabase.storage
          .from("galleries")
          .getPublicUrl(p.storage_path).data.publicUrl;
      }

      return {
        id: p.id,
        url: finalUrl,
        storage_path: p.storage_path,
      };
    }) || [];

  // 4. Fetch Favorites for the user
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
            className="object-cover object-[50%_15%] opacity-60 animate-reveal"
          />
        )}

        {/* Hero Text Overlay - Integrated Metadata */}
        <div className="relative z-10 text-center text-white space-y-4 px-6 pt-20">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-70">
            {gallery.category} Collection • {photos.length} Selected Works
          </p>
          <h1 className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none">
            {gallery.title}
          </h1>
          {/* Subtitle/Description (Optional Designer Request) */}
          <p className="text-sm md:text-lg font-light opacity-60 max-w-md mx-auto italic">
            Captured in{" "}
            {gallery.event_date
              ? new Date(gallery.event_date).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Lagos"}
          </p>
        </div>
      </section>

      {/* --- THE GRID AREA --- */}
      {/* Grid Container - Reduced top padding (Designer Request #7) */}
      <div id="grid" className="pt-8 pb-20">
        {photos.length > 0 ? (
          <GalleryClientView
            gallery={gallery}
            photos={photos}
            initialFavorites={favorites || []}
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
