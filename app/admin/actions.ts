"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGallery(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const eventDate = formData.get("eventDate") as string;
  const password = formData.get("password") as string;
  const category = formData.get("category") as string; // GET THE CATEGORY

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("galleries").insert([
    {
      title,
      event_date: eventDate || null,
      password: password || null,
      category: category || "Lifestyle", // SAVE THE CATEGORY
      photographer_id: user?.id,
      is_public: false,
    },
  ]);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteGallery(id: string) {
  const supabase = await createClient();

  // 1. Perform the delete
  // We remove the .eq('photographer_id', user.id) temporarily to see if it works
  const { error, count } = await supabase
    .from("galleries")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return {
      error:
        "Database found 0 galleries with that ID. It might already be gone.",
    };
  }

  // 2. FORCE REVALIDATION
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}
export async function assignGalleryToClient(
  galleryId: string,
  clientId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("galleries")
    .update({ client_id: clientId })
    .eq("id", galleryId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/gallery/${galleryId}`);
  return { success: true };
}
export async function setGalleryCover(galleryId: string, imagePath: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("galleries")
    .update({ cover_image_path: imagePath })
    .eq("id", galleryId);

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  // This tells Next.js to clear the old images and show the new cover immediately
  revalidatePath(`/admin/gallery/${galleryId}`);
  revalidatePath("/admin");
  revalidatePath("/portfolio");
  return { success: true };
}
export async function quickAddClient(fullName: string, email: string) {
  const supabase = await createClient();

  // This inserts a basic record into your public users table
  const { error } = await supabase
    .from("users")
    .insert([{ full_name: fullName, email: email, role: "client" }]);

  if (error) return { error: error.message };
  revalidatePath("/admin/clients");
  return { success: true };
}
// app/admin/actions.ts

// ... (keep your existing createGallery, deleteGallery, etc.)

export async function updateGallerySettings(
  id: string,
  settings: {
    password?: string;
    is_public?: boolean;
    category?: string;
    allow_download?: boolean; // Added this
    allow_favorites?: boolean; // Added this
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("galleries")
    .update(settings)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/gallery/${id}`);
  revalidatePath("/admin");
  return { success: true };
}
// app/admin/actions.ts

export async function togglePhotoFeature(photoId: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("photos")
    .update({ is_featured: isFeatured })
    .eq("id", photoId);

  if (error) return { error: error.message };

  // This is the critical part - we clear EVERY cache path
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleHeroStatus(photoId: string, isHero: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("photos")
    .update({ is_hero: isHero })
    .eq("id", photoId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
export async function refreshGallery(id: string) {
  // This clears the cache for both the Admin view and the Public view
  revalidatePath(`/admin/gallery/${id}`);
  revalidatePath(`/gallery/${id}`);
  revalidatePath(`/portfolio`);
}
export async function deletePhoto(
  photoId: string,
  storagePath: string,
  galleryId: string,
) {
  const supabase = await createClient();

  // 1. Delete from Supabase Storage
  await supabase.storage.from("galleries").remove([storagePath]);

  // 2. Delete from Database
  const { error } = await supabase.from("photos").delete().eq("id", photoId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/gallery/${galleryId}`);
  return { success: true };
}
