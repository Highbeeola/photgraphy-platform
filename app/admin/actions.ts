"use server";

import { createClient } from "@/lib/supabase/server"; // Import fix 1
import { revalidatePath } from "next/cache"; // Import fix 2

export async function createGallery(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const eventDate = formData.get("eventDate") as string;
  const isPublic = formData.get("isPublic") === "on";

  // Get current user and check if they exist
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to create a gallery." };
  }

  const { error } = await supabase.from("galleries").insert([
    {
      title,
      event_date: eventDate || null,
      is_public: isPublic,
      photographer_id: user.id,
    },
  ]);

  if (error) {
    console.error("Database Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
