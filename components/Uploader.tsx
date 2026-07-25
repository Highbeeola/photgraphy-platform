"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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
        const { error: uploadError } = await supabase.storage
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
    <div className="relative group">
      {/* Make the label the trigger. Labels work 100% on mobile. */}
      <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp" // Explicitly allow these
          onChange={uploadImages}
          disabled={uploading}
          className="sr-only" // Hide it but keep it functional
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-sm font-bold text-slate-700">
            {uploading ? "Uploading to Cloud..." : "Add Photos"}
          </p>
          <p className="text-xs text-slate-400">
            {uploading ? "Please wait..." : "Click here to open your library"}
          </p>
        </div>
      </label>

      {/* Progress Bar (Very important for mobile so they don't think it's frozen) */}
      {uploading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center p-10">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full animate-pulse w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
