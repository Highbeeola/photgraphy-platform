// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import CreateGalleryForm from "@/app/admin/CreateGalleryForm";
import { deleteGallery } from "@/app/admin/actions";
import { Trash2, Calendar, Image as ImageIcon } from "lucide-react";

import Link from "next/link";

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
            const coverPhoto = gallery.photos?.[0]?.storage_path;
            const coverUrl = coverPhoto
              ? supabase.storage.from("galleries").getPublicUrl(coverPhoto).data
                  .publicUrl
              : null;

            return (
              <div key={gallery.id} className="group relative">
                {/* 1. THE DELETE BUTTON (Positioned Top-Left) */}
                <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                  <form
                    action={async () => {
                      "use server";
                      await deleteGallery(gallery.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-xl backdrop-blur-md shadow-xl transition-colors cursor-pointer"
                      title="Delete Gallery"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>

                {/* 2. THE MAIN CARD LINK */}
                <Link
                  href={`/admin/gallery/${gallery.id}`}
                  className="block border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all duration-500"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={gallery.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                        <ImageIcon size={40} strokeWidth={1} />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                          Empty Gallery
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${
                          gallery.is_public
                            ? "bg-green-500 text-white"
                            : "bg-black/60 text-white"
                        }`}
                      >
                        {gallery.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition">
                      {gallery.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar size={14} />
                      <span>
                        {gallery.event_date
                          ? new Date(gallery.event_date).toLocaleDateString(
                              "en-US",
                              { month: "long", year: "numeric" },
                            )
                          : "Undated"}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {galleries?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 italic">
              No collections found. Create your first one above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
