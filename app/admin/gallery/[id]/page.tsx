export const dynamic = "force-dynamic"; // This stops the browser from showing old data
export const revalidate = 0; // This forces the database to be checked every single time

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Uploader from "@/components/Uploader";
import CopyLinkButton from "@/components/CopyLinkButton";
import PublishButton from "@/components/PublishButton";
import AdminPhotoControls from "@/components/AdminPhotoControls";
import {
  Eye,
  Image as ImageIcon,
  ChevronLeft,
  Globe,
  Heart,
  Lock,
} from "lucide-react";
import Link from "next/link";

// FIX 1: Explicitly type params as a Promise for Next.js 16
export default async function PixiesetGalleryManager({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // FIX 2: You MUST await params before using id
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Gallery
  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  // 2. Fetch Photos (Fresh every time, ordered by newest first)
  const { data: photos, error: photoError } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id)
    .order("created_at", { ascending: true });

  // Terminal logging to trace DB fetching
  console.log("Photos found in DB:", photos?.length);

  const { data: favorites } = await supabase
    .from("favorites")
    .select("photo_id")
    .in("photo_id", photos?.map((p) => p.id) || []);

  const favoriteIds = new Set(favorites?.map((f) => f.photo_id));

  const coverUrl = gallery.cover_image_path
    ? supabase.storage.from("galleries").getPublicUrl(gallery.cover_image_path)
        .data.publicUrl
    : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-full lg:w-80 border-r border-slate-100 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Link
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <ChevronLeft size={20} />
          </Link>
          <span className="font-bold text-slate-800 truncate">
            {gallery.title}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Visibility
            </p>
            {gallery.is_public ? (
              <div className="flex items-center gap-2 text-green-600">
                <Globe size={14} />
                <span className="text-xs font-bold uppercase">
                  Visible on Portfolio
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <Lock size={14} />
                <span className="text-xs font-bold uppercase">
                  Private (Link Only)
                </span>
              </div>
            )}
          </div>

          <div className="p-6 border-b border-slate-50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Gallery Cover
            </p>
            <div className="aspect-[3/2] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  className="w-full h-full object-cover"
                  alt="Cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <ImageIcon size={24} />
                  <span className="text-[10px] uppercase font-bold">
                    No Cover
                  </span>
                </div>
              )}
            </div>
          </div>

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
              <span className="text-lg font-mono font-bold tracking-widest bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 mt-2 inline-block">
                {gallery.password || "None"}
              </span>
            </div>
          </div>
        </div>

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
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h1 className="text-xl font-serif italic lg:block hidden">
            Highlights
          </h1>
          <div className="flex gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex gap-2">
              <CopyLinkButton galleryId={id} />
              <PublishButton galleryId={id} isPublic={gallery.is_public} />
            </div>
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

          {/* Photo Grid with Mobile-Friendly Controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                      : "border-slate-100"
                  }`}
                >
                  <img
                    src={publicUrl}
                    className="object-cover w-full h-full"
                    alt="Gallery item"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-md h-12 flex items-center z-20 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300">
                    <AdminPhotoControls
                      photoId={photo.id}
                      galleryId={id}
                      storagePath={photo.storage_path}
                      initialIsHero={photo.is_hero}
                      initialIsFeatured={photo.is_featured}
                      isCurrentCover={isCover}
                    />
                  </div>

                  {/* Favorite Indicator */}
                  {isFavorited && (
                    <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm z-10 animate-in zoom-in">
                      <Heart size={10} className="text-red-500 fill-red-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
