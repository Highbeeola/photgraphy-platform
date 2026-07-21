import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GalleryClientView from "@/components/GalleryClientView";

export default async function ClientGalleryPage({
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

  // 2. Fetch Photos
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id);

  // 3. Fetch Favorites for the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: favorites } = user
    ? await supabase
        .from("favorites")
        .select("photo_id")
        .eq("client_id", user.id)
    : { data: [] };

  const photos =
    photosData?.map((p) => ({
      ...p,
      url: supabase.storage.from("galleries").getPublicUrl(p.storage_path).data
        .publicUrl,
    })) || [];

  return (
    <GalleryClientView
      gallery={gallery}
      photos={photos}
      initialFavorites={favorites || []}
    />
  );
}
