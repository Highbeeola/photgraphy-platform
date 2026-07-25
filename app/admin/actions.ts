"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGallery(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const eventDate = formData.get("eventDate") as string;
  const isPublic = formData.get("isPublic") === "on";
  const password = formData.get("password") as string;
  const category = formData.get("category") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { error } = await supabase.from("galleries").insert([
    {
      title,
      event_date: eventDate || null,
      is_public: isPublic,
      photographer_id: user.id,
      password: password || null,
      category: category || null,
    },
  ]);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteGallery(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("galleries")
    .delete()
    .eq("id", id)
    .eq("photographer_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
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
  settings: { password?: string; is_public?: boolean; category?: string },
) {
  const supabase = await createClient();

  // We explicitly list the allowed fields to update
  const { error } = await supabase
    .from("galleries")
    .update(settings)
    .eq("id", id);

  if (error) {
    console.error("Update Error:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/gallery/${id}`);
  revalidatePath("/admin");
  revalidatePath("/portfolio");
  return { success: true };
}
