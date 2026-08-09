export const dynamic = "force-dynamic"; // This stops the browser from showing old data
export const revalidate = 0; // This forces the database to be checked every single time

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Uploader from "@/components/Uploader";
import CopyLinkButton from "@/components/CopyLinkButton";
import PublishButton from "@/components/PublishButton";
import AdminPhotoControls from "@/components/AdminPhotoControls";
import SmartImage from "@/components/SmartImage";
import EditableGalleryTitle from "@/components/EditableGalleryTitle";
import { updateGallerySettings } from "@/app/admin/actions";
import {
  Eye,
  Image as ImageIcon,
  ChevronLeft,
  Globe,
  Heart,
  Lock,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default async function PixiesetGalleryManager({
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

  // 2. Fetch Photos (Fresh every time, ordered by newest first)
  const { data: photos, error: photoError } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id)
    .order("created_at", { ascending: true });

  // 3. FETCH FAVORITES WITH GUEST/CLIENT EMAIL
  const { data: favorites } = await supabase
    .from("favorites")
    .select("photo_id, guest_email")
    .in("photo_id", photos?.map((p) => p.id) || []);

  const favoriteIds = new Set(favorites?.map((f) => f.photo_id));

  // Group favorites by client/guest email
  const favoritesByEmail = (favorites || []).reduce(
    (acc, fav) => {
      const email = fav.guest_email || "Anonymous Client";
      if (!acc[email]) acc[email] = 0;
      acc[email] += 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const coverUrl = gallery.cover_image_path
    ? gallery.cover_image_path.startsWith("http")
      ? gallery.cover_image_path
      : supabase.storage
          .from("galleries")
          .getPublicUrl(gallery.cover_image_path).data.publicUrl
    : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-80 border-r border-slate-100 bg-white flex-col shrink-0 h-screen sticky top-0">
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

        <div className="flex-1 overflow-y-auto pb-20">
          {/* Gallery Name Inline Editable Field (Desktop) */}
          <div className="p-6 border-b border-slate-50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Gallery Name
            </p>
            <EditableGalleryTitle id={id} initialTitle={gallery.title} />
          </div>

          {/* Visibility Badge */}
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Visibility
            </p>
            {gallery.is_public ? (
              <div className="flex items-center gap-2 text-emerald-600">
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

          {/* Cover Preview */}
          <div className="p-6 border-b border-slate-50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Gallery Cover
            </p>
            <div className="aspect-[3/2] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  className="w-full h-full object-cover"
                  alt="Cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 font-serif italic text-xs">
                  No Cover Set
                </div>
              )}
            </div>
          </div>

          {/* CLIENT FAVORITES SUMMARY BY EMAIL */}
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Client Selections
              </p>
              <Heart size={12} className="text-red-500 fill-red-500" />
            </div>

            {Object.keys(favoritesByEmail).length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No favorites selected yet
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(favoritesByEmail).map(([email, count]) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <UserCheck
                        size={14}
                        className="text-slate-400 shrink-0"
                      />
                      <span className="font-medium text-slate-700 truncate">
                        {email}
                      </span>
                    </div>
                    <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection Permissions Toggles */}
          <div className="p-6 space-y-6 border-b border-slate-50 bg-slate-50/30">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              Collection Permissions
            </p>

            <div className="space-y-4">
              {/* Toggle: Downloads */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  Download
                </span>
                <form
                  action={async () => {
                    "use server";
                    await updateGallerySettings(id, {
                      allow_download: !gallery.allow_download,
                    });
                  }}
                >
                  <button
                    type="submit"
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      gallery.allow_download ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        gallery.allow_download ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </form>
              </div>

              {/* Toggle: Favorites */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  Favorite
                </span>
                <form
                  action={async () => {
                    "use server";
                    await updateGallerySettings(id, {
                      allow_favorites: !gallery.allow_favorites,
                    });
                  }}
                >
                  <button
                    type="submit"
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      gallery.allow_favorites
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        gallery.allow_favorites ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Access Info */}
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Access PIN
              </p>
              <span className="text-lg font-mono font-bold tracking-widest bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 mt-2 inline-block uppercase">
                {gallery.password || "None"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link
            href={`/gallery/${gallery.slug}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200"
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
              <CopyLinkButton galleryId={gallery.slug} />
              <PublishButton galleryId={id} isPublic={gallery.is_public} />
            </div>
            <Link
              href={`/gallery/${gallery.slug}`}
              target="_blank"
              className="lg:hidden p-2 bg-slate-100 rounded-lg"
            >
              <Eye size={18} />
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-10">
          {/* MOBILE-ONLY SETTINGS (Visible only on small screens) */}
          <div className="lg:hidden bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Settings
              </span>
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${gallery.is_public ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
              >
                {gallery.is_public ? "LIVE" : "DRAFT"}
              </div>
            </div>

            {/* Editable Gallery Name on Mobile */}
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Gallery Name
              </p>
              <EditableGalleryTitle id={id} initialTitle={gallery.title} />
            </div>

            {/* Mobile Client Selections Summary */}
            <div className="border-b border-slate-200 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                Client Selections
              </p>
              {Object.keys(favoritesByEmail).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No favorites selected
                </p>
              ) : (
                <div className="space-y-1">
                  {Object.entries(favoritesByEmail).map(([email, count]) => (
                    <div
                      key={email}
                      className="flex justify-between items-center text-xs text-slate-600"
                    >
                      <span className="truncate">{email}</span>
                      <span className="font-bold">{count} photos</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOGGLES */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-600">
                <span>Allow Downloads</span>
                <form
                  action={async () => {
                    "use server";
                    await updateGallerySettings(id, {
                      allow_download: !gallery.allow_download,
                    });
                  }}
                >
                  <button
                    type="submit"
                    className={`w-10 h-5 rounded-full relative transition-all ${gallery.allow_download ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${gallery.allow_download ? "left-6" : "left-1"}`}
                    />
                  </button>
                </form>
              </div>

              <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-600">
                <span>
                  Access PIN:{" "}
                  <span className="font-mono text-black ml-2">
                    {gallery.password || "NONE"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <Uploader galleryId={id} />

          {/* Photo Grid with Mobile-Friendly Controls or Empty State */}
          {photos?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <ImageIcon size={32} strokeWidth={1} />
              </div>
              <p className="text-sm font-serif italic text-slate-400">
                Your collection is empty.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-1">
                Upload your first highlights above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {photos?.map((photo) => {
                const publicUrl = photo.storage_path.startsWith("http")
                  ? photo.storage_path
                  : supabase.storage
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
                    {/* SmartImage Component */}
                    <SmartImage src={publicUrl} alt="Gallery item" />

                    {/* Toolbar Overlay */}
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
                        <Heart
                          size={10}
                          className="text-red-500 fill-red-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
