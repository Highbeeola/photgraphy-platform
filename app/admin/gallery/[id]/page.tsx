import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Uploader from "@/components/Uploader";
import CopyLinkButton from "@/components/CopyLinkButton";
import PublishButton from "@/components/PublishButton";
import {
  Eye,
  Image as ImageIcon,
  Settings,
  Share2,
  ChevronLeft,
  Check,
  Globe,
  Heart,
  Lock,
  Star,
} from "lucide-react";
import {
  setGalleryCover,
  updateGallerySettings,
  togglePhotoFeature,
} from "../../actions"; // Make sure togglePhotoFeature is exported in actions.ts
import Link from "next/link";

export default async function PixiesetGalleryManager({ params }: any) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id);

  if (!gallery) notFound();

  // 1. Fetch favorites for this specific gallery
  const { data: favorites } = await supabase
    .from("favorites")
    .select("photo_id")
    // We check which photos in THIS gallery are in the favorites table
    .in("photo_id", photos?.map((p) => p.id) || []);

  const favoriteIds = new Set(favorites?.map((f) => f.photo_id));

  const coverUrl = gallery.cover_image_path
    ? supabase.storage.from("galleries").getPublicUrl(gallery.cover_image_path)
        .data.publicUrl
    : null;

  return (
    /* Changed h-screen to min-h-screen and removed overflow-hidden to allow scrolling */
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* 1. LEFT SIDEBAR - Optimized for Desktop, Hidden/Sticky on Mobile */}
      <aside className="w-full lg:w-80 border-r border-slate-100 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Link
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <ChevronLeft size={20} />
          </Link>
          {/* We keep the title here for the sidebar view */}
          <span className="font-bold text-slate-800 truncate">
            {gallery.title}
          </span>
        </div>

        {/* This area now scrolls if the screen is short */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {/* Visibility Section */}
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Visibility
            </p>
            {gallery.is_public ? (
              <div className="flex items-center gap-2 text-green-600">
                <Globe size={14} />
                <span className="text-xs font-bold uppercase tracking-tight">
                  Visible on Portfolio
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <Lock size={14} />
                <span className="text-xs font-bold uppercase tracking-tight">
                  Private (Link Only)
                </span>
              </div>
            )}
          </div>

          {/* Cover Preview Section */}
          <div className="p-6 border-b border-slate-50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Gallery Cover
            </p>
            <div className="aspect-[3/2] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  className="w-full h-full object-cover"
                  alt="Cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <ImageIcon size={24} strokeWidth={1} />
                  <span className="text-[10px] uppercase font-bold">
                    No Cover
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats & PIN */}
          <div className="p-6 space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
                Client Activity
              </p>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-blue-600 fill-blue-600" />
                <span className="text-sm font-bold text-blue-900">
                  {favoriteIds.size} Favorites
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Access PIN
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-mono font-bold tracking-widest bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                  {gallery.password || "None"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only Preview Button fixed at bottom of sidebar or hidden */}
        <div className="hidden lg:block p-4 border-t border-slate-100">
          <Link
            href={`/gallery/${id}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest"
          >
            <Eye size={16} /> Preview Gallery
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 bg-white">
        {/* We REMOVED the redundant title header from here to fix the "Double Title" */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="lg:hidden">
            {/* This only shows on mobile */}
            <span className="font-bold text-xs uppercase tracking-widest">
              Highlights
            </span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-serif italic">Highlights</h1>
          </div>

          <div className="flex gap-3">
            <CopyLinkButton galleryId={id} />

            {/* NEW INTERACTIVE BUTTON */}
            <PublishButton galleryId={id} isPublic={gallery.is_public} />

            <Link
              href={`/gallery/${id}`}
              target="_blank"
              className="lg:hidden p-2 bg-slate-100 rounded-lg"
            >
              <Eye size={18} />
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-10">
          <Uploader galleryId={id} />

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {photos?.map((photo) => {
              const publicUrl = supabase.storage
                .from("galleries")
                .getPublicUrl(photo.storage_path).data.publicUrl;
              const isCover = gallery.cover_image_path === photo.storage_path;
              const isFavorited = favoriteIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    isCover
                      ? "border-blue-500 ring-4 ring-blue-50"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={publicUrl}
                    className="object-cover w-full h-full"
                    alt="Gallery item"
                  />

                  {/* Top-left controls (Feature Star Button) */}
                  <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <form
                      action={async () => {
                        "use server";
                        await togglePhotoFeature(photo.id, !photo.is_featured);
                      }}
                    >
                      <button
                        type="submit"
                        className={`p-2 rounded-full backdrop-blur-md transition ${
                          photo.is_featured
                            ? "bg-amber-400 text-white"
                            : "bg-white/80 text-slate-400 hover:text-amber-500"
                        }`}
                      >
                        <Star
                          size={14}
                          fill={photo.is_featured ? "currentColor" : "none"}
                        />
                      </button>
                    </form>
                  </div>

                  {isFavorited && (
                    <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm z-10">
                      <Heart size={12} className="text-red-500 fill-red-500" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isCover ? (
                      <div className="bg-blue-500 text-white p-2 rounded-full">
                        <Check size={20} />
                      </div>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await setGalleryCover(id, photo.storage_path);
                        }}
                      >
                        <button
                          type="submit"
                          className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-110 transition cursor-pointer"
                        >
                          Set as Cover
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
