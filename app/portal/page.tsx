import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch only galleries assigned to THIS specific client
  const { data: myGalleries } = await supabase
    .from('galleries')
    .select('*, photos(storage_path)')
    .eq('client_id', user?.id);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Subtle Logo Header */}
      <nav className="p-10 flex justify-center border-b border-slate-100 bg-white">
        <Link href="/" className="text-xl font-serif italic uppercase tracking-tighter">
          Dara Pixel
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-10 space-y-16">
        <header className="space-y-2">
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">Client Archive</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-slate-900 italic">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-400 font-light max-w-md">
            Your private collections and cherished memories are preserved here.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {myGalleries && myGalleries.length > 0 ? (
            myGalleries.map((gallery) => {
              const coverPhoto = gallery.photos?.[0]?.storage_path;
              const coverUrl = coverPhoto 
                ? supabase.storage.from('galleries').getPublicUrl(coverPhoto).data.publicUrl 
                : null;
              
              return (
                <Link key={gallery.id} href={`/gallery/${gallery.id}`} className="group space-y-6 block">
                  <div className="aspect-[3/2] bg-slate-200 overflow-hidden shadow-sm transition-all duration-700 group-hover:shadow-2xl relative">
                    {coverUrl && (
                      <img src={coverUrl} className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif italic text-slate-800 group-hover:text-black transition">
                      {gallery.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                      View Collection — {gallery.event_date ? new Date(gallery.event_date).getFullYear() : 'Recent'}
                    </p>
                  </div>
                </Link>
              )
            })
          ) : (
            /* IMPROVED EMPTY STATE */
            <div className="col-span-full py-32 border border-dashed border-slate-200 rounded-sm text-center space-y-4">
              <p className="font-serif italic text-slate-400 text-xl">No private collections found.</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                If you were expecting a gallery, please contact Dara Pixel Studio.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-20 text-center">
        <Link href="/" className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-black transition">
          Return to Studio Home
        </Link>
      </footer>
    </div>
  );
}