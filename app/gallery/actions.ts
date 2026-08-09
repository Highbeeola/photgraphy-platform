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

export async function toggleGuestFavorite(
  photoId: string,
  galleryId: string,
  email: string,
) {
  const supabase = await createClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("photo_id", photoId)
    .eq("guest_email", email.toLowerCase())
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({
      photo_id: photoId,
      guest_email: email.toLowerCase(),
    });
  }

  revalidatePath(`/gallery/${galleryId}`);
}

export async function bulkFavorite(
  photoIds: string[],
  email: string,
  galleryId: string,
  gallerySlug: string,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  if (!email) throw new Error("Email is required");

  // Format the records including photo_id, gallery_id, and normalized guest_email
  const records = photoIds.map((id) => ({
    photo_id: id,
    gallery_id: galleryId,
    guest_email: email.toLowerCase(),
  }));

  const { error } = await supabase.from("favorites").insert(records);

  if (error) {
    console.error("Bulk Favorite Error:", error);
    return { error: error.message };
  }

  revalidatePath(`/gallery/${gallerySlug}`);
  return { success: true };
}
