"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Uploader({ galleryId }: { galleryId: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        // 1. Create a unique path
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${galleryId}/${fileName}`;

        // 2. Upload with explicit content type and upsert
        const { error: uploadError, data } = await supabase.storage
          .from("galleries") // MUST MATCH BUCKET NAME EXACTLY
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // This prevents 400 errors on duplicate attempts
            contentType: file.type, // Explicitly set the mime type (image/png, etc)
          });

        if (uploadError) {
          console.error("Storage Error Detail:", uploadError);
          throw uploadError;
        }

        // 3. Database Insert
        const { error: dbError } = await supabase.from("photos").insert({
          gallery_id: galleryId,
          storage_path: filePath,
        });

        if (dbError) throw dbError;
      }

      toast.success("Upload complete!");
      router.refresh();
    } catch (error: any) {
      // Log the full error to see exactly what Supabase is complaining about
      console.log("Full Error Object:", error);
      toast.error(`Upload failed: ${error.message || "Check console"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={uploadImages}
        disabled={uploading}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-700">
          {uploading ? "Uploading..." : "Click or drag to upload photos"}
        </p>
        <p className="text-sm text-slate-500 mt-1">JPG, PNG, WebP allowed.</p>
      </div>
    </div>
  );
}
