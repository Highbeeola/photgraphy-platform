import { createClient } from "@/lib/supabase/server"; // Fixes 'createClient'
import { revalidatePath } from "next/cache"; // Fixes 'revalidatePath'
import CreateGalleryForm from "./CreateGalleryForm"; // Ensure this file exists in the same folder
import { deleteGallery } from "./actions"; // Ensure 'actions.ts' exists in the same folder
import { Trash2, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: galleries } = await supabase
    .from("galleries")
    .select(`*, photos (storage_path)`)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* 
          If you get an error on <CreateGalleryForm />, 
          make sure the file is named 'CreateGalleryForm.tsx' (case sensitive) 
      */}
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
                {/* --- NEW: THE COPY LINK BUTTON (TOP RIGHT) --- */}
                <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <CopyLinkButton galleryId={gallery.id} />
                </div>

                {/* --- EXISTING: THE DELETE BUTTON (TOP LEFT) --- */}
                <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <form
                    action={async () => {
                      "use server";
                      await deleteGallery(gallery.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>

                {/* CARD LINK */}
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
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                          Empty
                        </span>
                      </div>
                    )}

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

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition truncate">
                      {gallery.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-2 font-medium">
                      <Calendar size={14} />
                      <span>
                        {gallery.event_date
                          ? new Date(gallery.event_date).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )
                          : "No Date"}
                      </span>
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