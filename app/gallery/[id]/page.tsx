import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GalleryClientView from "@/components/GalleryClientView";
import GalleryPasswordGateway from "@/components/GalleryPasswordGateway";

export default async function ClientGalleryPage({ params, searchParams }: any) {
  const { id } = await params;
  const { pw } = await searchParams;
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();
  if (!gallery) notFound();

  // 1. SECURITY: If not published and not admin, hide it
  // (We'll implement this fully later, for now let's focus on the look)

  // 2. PASSWORD CHECK
  if (gallery.password && gallery.password !== pw) {
    return <GalleryPasswordGateway galleryId={id} />;
  }

  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id);

  const photos =
    photosData?.map((p) => ({
      ...p,
      url: supabase.storage.from("galleries").getPublicUrl(p.storage_path).data
        .publicUrl,
    })) || [];

  const coverUrl = gallery.cover_image_path
    ? supabase.storage.from("galleries").getPublicUrl(gallery.cover_image_path)
        .data.publicUrl
    : photos[0]?.url;

  return (
    <div className="min-h-screen bg-white">
      {/* --- THE CINEMATIC HERO --- */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={coverUrl}
            className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000"
            alt={gallery.title}
          />
          <div className="absolute inset-0 bg-black/30" /> {/* Soft Overlay */}
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 text-center text-white space-y-4 px-4">
          <p className="text-[10px] uppercase tracking-[0.6em] font-bold opacity-80 animate-in slide-in-from-bottom duration-700">
            {gallery.event_date
              ? new Date(gallery.event_date).getFullYear()
              : "Collection"}
          </p>
          <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter animate-in slide-in-from-bottom duration-1000">
            {gallery.title}
          </h1>
          <div className="pt-10 animate-bounce opacity-50">
            <div className="w-[1px] h-16 bg-white mx-auto" />
          </div>
        </div>
      </section>

      {/* --- THE GRID AREA --- */}
      <div id="grid" className="py-20">
        <GalleryClientView
          gallery={gallery}
          photos={photos}
          initialFavorites={[]}
        />
      </div>
    </div>
  );
}
