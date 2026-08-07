import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import CreateGalleryForm from "./CreateGalleryForm";
import { Calendar, Image as ImageIcon, Eye } from "lucide-react";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";
import DeleteGalleryButton from "@/components/DeleteGalleryButton";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: galleries } = await supabase
    .from("galleries")
    .select(`*, photos (storage_path)`)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <CreateGalleryForm />

      <section>
        <h1 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight">
          Your Collections
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries?.map((gallery) => {
            const coverPath =
              gallery.cover_image_path || gallery.photos?.[0]?.storage_path;

            const coverUrl = coverPath
              ? coverPath.startsWith("http")
                ? coverPath
                : supabase.storage.from("galleries").getPublicUrl(coverPath)
                    .data.publicUrl
              : null;

            return (
              <div key={gallery.id} className="group relative">
                {/* 1. THE DELETE BUTTON (Client Component with modal/confirm support) */}
                <div className="absolute top-3 left-3 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                  <DeleteGalleryButton
                    galleryId={gallery.id}
                    galleryTitle={gallery.title}
                  />
                </div>

                {/* 2. THE SHARE BUTTON (Visible on mobile, hover-only on desktop) */}
                <div className="absolute top-3 right-3 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                  <CopyLinkButton galleryId={gallery.id} />
                </div>

                {/* 3. THE CARD LINK */}
                <Link
                  href={`/admin/gallery/${gallery.id}`}
                  className="block border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-2 transition-transform duration-500 ease-out"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={gallery.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                        <ImageIcon size={40} strokeWidth={1} />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                          Empty
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-3 right-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider ${
                          gallery.is_public
                            ? "bg-green-500/80 text-white"
                            : "bg-black/50 text-white"
                        }`}
                      >
                        {gallery.is_public ? "LIVE" : "DRAFT"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {gallery.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {gallery.category || "Lifestyle"}
                      </p>
                      <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold">
                        <Eye size={10} /> {gallery.view_count ?? 0} VIEWS
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {galleries?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 italic">
            No collections found.
          </div>
        )}
      </section>
    </div>
  );
}
