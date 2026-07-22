import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import GalleryClientView from "@/components/GalleryClientView";
import GalleryPasswordGateway from "@/components/GalleryPasswordGateway"; // We'll build this

export default async function ClientGalleryPage({ params, searchParams }: any) {
  const { id } = await params;
  const { pw } = await searchParams; // Check if password was provided in URL
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();
  if (!gallery) notFound();

  // 1. Check if the gallery needs a password
  if (gallery.password && gallery.password !== pw) {
    // If no password or wrong password, show the PIN pad
    return <GalleryPasswordGateway galleryId={id} />;
  }

  // 2. If it's Public or the Password is correct, show the photos
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id);
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
      initialFavorites={[]}
    />
  );
}
