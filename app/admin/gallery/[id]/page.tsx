import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Uploader from "@/components/Uploader";
import Link from "next/link";
import { Eye } from "lucide-react"; // Add this import

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // Must be a Promise in Next.js 15
}) {
  const { id } = await params; // Await the params
  const supabase = await createClient();

  // 1. Fetch gallery details
  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  // 2. Fetch photos for this gallery
  const { data: photos, error: photoError } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id); // Corrected filter

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Navigation */}
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-black">
          Galleries
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-medium">{gallery.title}</span>
      </nav>

      {/* Header with Preview Button */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{gallery.title}</h1>
          <p className="text-slate-500 mt-1">Manage this collection</p>
        </div>

        {/* THE PREVIEW BUTTON */}
        <Link
          href={`/gallery/${gallery.id}`}
          target="_blank"
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-50 transition shadow-sm"
        >
          <Eye size={18} />
          Preview as Client
        </Link>
      </div>

      {/* Uploader Component */}
      <Uploader galleryId={gallery.id} />

      {/* Photo Grid Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          Gallery Images ({photos?.length || 0})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos?.map((photo) => {
            const publicUrl = supabase.storage
              .from("galleries")
              .getPublicUrl(photo.storage_path).data.publicUrl;

            // For the grid view, we can tell Supabase to resize it (if you have Pro plan)
            // Otherwise, use CSS to contain it.
            return (
              <div
                key={photo.id}
                className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border"
              >
                <img
                  src={publicUrl}
                  alt="Gallery Item"
                  className="object-cover w-full h-full"
                />

                {/* Overlay with Download Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={publicUrl}
                    download
                    target="_blank"
                    className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition"
                  >
                    Download Original
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {photos?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
            <p className="text-slate-400">
              No photos uploaded yet. Use the uploader above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
