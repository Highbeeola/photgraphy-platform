"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitBooking(formData: FormData) {
  const supabase = await createClient();

  const client_name = formData.get("name") as string;
  const client_email = formData.get("email") as string;
  const session_type = formData.get("type") as string;
  const message = formData.get("message") as string;

  const { error } = await supabase
    .from("bookings")
    .insert([{ client_name, client_email, session_type, message }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}
