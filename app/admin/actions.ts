"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGallery(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const eventDate = formData.get("eventDate") as string;
  const isPublic = formData.get("isPublic") === "on";

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
