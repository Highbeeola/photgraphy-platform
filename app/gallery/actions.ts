"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(photoId: string, galleryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please login to favorite photos" };

  // Check if it's already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("*")
    .eq("photo_id", photoId)
    .eq("client_id", user.id)
    .single();

  if (existing) {
    // Remove favorite
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    // Add favorite
    await supabase.from("favorites").insert({
      photo_id: photoId,
      client_id: user.id,
    });
  }

  revalidatePath(`/gallery/${galleryId}`);
}
