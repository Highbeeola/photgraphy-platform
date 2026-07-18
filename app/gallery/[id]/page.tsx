import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton"; // Add this import

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch the gallery
  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  // 2. Fetch the photos
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id);

  // 3. Fetch favorites for this gallery to verify user selection states
  const { data: favorites } = await supabase
    .from("favorites")
    .select("photo_id")
    .eq("gallery_id", id);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Sophisticated Header */}
      <header className="py-20 px-4 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900">
          {gallery.title}
        </h1>
        <p className="text-slate-500 uppercase tracking-[0.3em] text-xs">
          {gallery.event_date
            ? new Date(gallery.event_date).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>
        <div className="w-12 h-[1px] bg-slate-300 mx-auto mt-8" />
      </header>

      {/* 2. Responsive Masonry-style Grid */}
      <main className="max-w-[1600px] mx-auto px-4 pb-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos?.map((photo) => {
            const publicUrl = supabase.storage
              .from("galleries")
              .getPublicUrl(photo.storage_path).data.publicUrl;

            // 1. Check if this photo is favorited
            const isFavorited =
              favorites?.some((f) => f.photo_id === photo.id) || false;

            return (
              <div
                key={photo.id}
                className="relative group overflow-hidden break-inside-avoid rounded-sm"
              >
                <img
                  src={publicUrl}
                  alt="Gallery Image"
                  className="w-full h-auto object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    {/* NEW HEART BUTTON */}
                    <FavoriteButton
                      photoId={photo.id}
                      galleryId={id}
                      isInitiallyFavorited={isFavorited}
                    />
                  </div>

                  {/* THE DOWNLOAD BUTTON (High Quality) */}
                  <a
                    href={publicUrl}
                    download={`photo-${photo.id}.jpg`} // Suggests a filename
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-center bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-100 transition shadow-xl"
                  >
                    Download High-Res
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {(!photos || photos.length === 0) && (
          <div className="text-center py-20 text-slate-400 italic">
            This gallery is currently being curated. Check back soon.
          </div>
        )}
      </main>

      {/* 3. Simple Brand Footer */}
      <footer className="py-20 border-t border-slate-100 text-center">
        <p className="text-sm font-serif italic text-slate-900">
          Lens & Light Photography
        </p>
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition mt-4 inline-block"
        >
          Return to Home
        </Link>
      </footer>
    </div>
  );
}
