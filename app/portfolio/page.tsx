import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: galleries } = await supabase
    .from("galleries")
    .select("*, photos(storage_path)")
    .eq("is_public", true);

  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-5xl font-serif italic text-center mb-20">
        Portfolio
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {galleries?.map((g) => (
          <Link
            key={g.id}
            href={`/gallery/${g.id}`}
            className="group space-y-4"
          >
            <div className="aspect-[4/5] bg-slate-100 overflow-hidden rounded-sm">
              {/* Show first image as cover */}
              <img
                src={
                  supabase.storage
                    .from("galleries")
                    .getPublicUrl(g.photos[0]?.storage_path).data.publicUrl
                }
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700"
              />
            </div>
            <h3 className="text-xl font-serif">{g.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
