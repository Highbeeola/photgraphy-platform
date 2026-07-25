import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Uploader from "@/components/Uploader";
import CopyLinkButton from "@/components/CopyLinkButton";
import {
  Eye,
  Image as ImageIcon,
  Settings,
  Share2,
  ChevronLeft,
  Check,
  Globe,
  Heart,
} from "lucide-react";
import { setGalleryCover, updateGallerySettings } from "../../actions"; // Make sure these are exported in actions.ts
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
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      {/* Mobile Header - only visible on small screens */}
      <header className="lg:hidden p-4 border-b bg-white flex justify-between items-center sticky top-0 z-50">
        <Link href="/admin">
          <ChevronLeft />
        </Link>
        <span className="font-bold text-sm uppercase tracking-widest">
          {gallery.title}
        </span>
        <CopyLinkButton galleryId={id} />
      </header>

      {/* 1. LEFT SIDEBAR - Management */}
      <aside className="w-80 border-r border-slate-100 bg-white flex flex-col shrink-0 h-full">
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
                  No Cover Set
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 italic text-center">
            {" "}
            Hover over any image in the grid to set it as cover{" "}
          </p>
        </div>

        {/* 2. Stat Card in the Sidebar */}
        <div className="p-6 bg-blue-50/50 border-y border-blue-100">
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
            Client Activity
          </p>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-blue-600 fill-blue-600" />
            <span className="text-sm font-bold text-blue-900">
              {favoriteIds.size} Photos Favorited
            </span>
          </div>
        </div>

        {/* Info Section (Replaces redundant PIN input) */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${gallery.is_public ? "bg-green-500" : "bg-orange-400"}`}
              />
              <span className="text-sm font-medium">
                {gallery.is_public ? "Published" : "Draft"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Access Code
            </p>
            <span className="text-sm font-mono bg-slate-50 px-2 py-1 rounded mt-1 inline-block">
              {gallery.password || "None"}
            </span>
          </div>
        </div>

        <div className="mt-auto p-4 space-y-2 border-t border-slate-100">
          <Link
            href={`/gallery/${id}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition shadow-sm"
          >
            <Eye size={16} /> Preview Gallery
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA - Grid & Uploader */}
      <main className="flex-1 overflow-y-auto bg-white">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif italic text-slate-900">
              Highlights
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {photos?.length || 0} images uploaded
            </p>
          </div>

          <div className="flex gap-3">
            {/* SHARE BUTTON: Now wraps the CopyLink logic */}
            <CopyLinkButton galleryId={id} />

            {/* PUBLISH BUTTON: Link this to your is_public toggle */}
            <form
              action={async () => {
                "use server";
                await updateGallerySettings(id, {
                  is_public: !gallery.is_public,
                });
              }}
            >
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg ${gallery.is_public ? "bg-slate-100 text-slate-600" : "bg-[#00c2a0] text-white hover:bg-[#00ad8e]"}`}
              >
                {gallery.is_public ? "Unpublish" : "Publish"}
              </button>
            </form>
          </div>
        </header>

        <div className="p-8 space-y-12">
          {/* Uploader */}
          <Uploader galleryId={id} />

          {/* 3. The Photo Grid */}
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
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${isCover ? "border-blue-500 ring-4 ring-blue-50" : "border-transparent"}`}
                >
                  <img
                    src={publicUrl}
                    className="object-cover w-full h-full"
                    alt="Gallery item"
                  />

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
