// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import CreateGalleryForm from "./CreateGalleryForm";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // PRO TIP: We fetch galleries AND their photos to show a cover image
  const { data: galleries } = await supabase
    .from("galleries")
    .select(
      `
      *,
      photos (
        storage_path
      )
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <CreateGalleryForm />

      <section>
        <h1 className="text-3xl font-bold mb-6 text-slate-800 tracking-tight">
          Your Collections
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries?.map((gallery) => {
            // Get the first photo to use as a cover image
            const coverPhoto = gallery.photos?.[0]?.storage_path;
            const coverUrl = coverPhoto
              ? supabase.storage.from("galleries").getPublicUrl(coverPhoto).data
                  .publicUrl
              : null;

            return (
              <Link
                key={gallery.id}
                href={`/admin/gallery/${gallery.id}`}
                className="group border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300"
              >
                {/* Visual Cover */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={gallery.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs uppercase tracking-widest font-semibold">
                      No Photos Yet
                    </div>
                  )}
                  {/* Status Badge Over Image */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-sm ${
                        gallery.is_public
                          ? "bg-green-500 text-white"
                          : "bg-white/90 text-slate-700 backdrop-blur-sm"
                      }`}
                    >
                      {gallery.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition">
                    {gallery.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {gallery.event_date
                      ? new Date(gallery.event_date).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )
                      : "No date set"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
