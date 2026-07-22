// app/portal/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch only galleries assigned to THIS specific client
  const { data: myGalleries } = await supabase
    .from("galleries")
    .select("*, photos(storage_path)")
    .eq("client_id", user?.id);

  return (
    <div className="min-h-screen bg-white">
      <nav className="p-10 flex justify-center border-b border-slate-50">
        <h1 className="text-xl font-serif italic uppercase tracking-widest">
          Dara Pixel Portal
        </h1>
      </nav>

      <main className="max-w-6xl mx-auto p-10 space-y-12">
        <header>
          <h2 className="text-4xl font-serif">
            Welcome back, {user?.email?.split("@")[0]}
          </h2>
          <p className="text-slate-400 mt-2">
            Your private collections are ready for viewing.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {myGalleries?.map((gallery) => {
            const coverUrl = supabase.storage
              .from("galleries")
              .getPublicUrl(gallery.photos[0]?.storage_path).data.publicUrl;

            return (
              <Link
                key={gallery.id}
                href={`/gallery/${gallery.id}`}
                className="group space-y-4"
              >
                <div className="aspect-video bg-slate-100 overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={coverUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
                <h3 className="text-xl font-serif italic underline decoration-slate-200 underline-offset-8">
                  {gallery.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
