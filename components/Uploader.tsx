"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { refreshGallery } from "@/app/admin/actions";

export default function Uploader({ galleryId }: { galleryId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // 1. UPLOAD TO CLOUDINARY
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        );
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );

        const data = await res.json();

        // Check if Cloudinary actually gave us a URL
        if (!res.ok) {
          console.error("Cloudinary Error:", data);
          throw new Error(data.error?.message || "Cloudinary upload failed");
        }

        const cloudinaryUrl = data.secure_url; // This is the full 'https://...' link

        // 2. SAVE TO SUPABASE (Only if Cloudinary succeeded)
        const { error: dbError } = await supabase.from("photos").insert({
          gallery_id: galleryId,
          storage_path: cloudinaryUrl, // WE ARE NOW SAVING THE FULL URL
        });

        if (dbError) throw dbError;
      }

      toast.success("All images processed by Cloudinary!");
      await refreshGallery(galleryId);
      window.location.reload();
    } catch (error: any) {
      console.error("Pipeline Failure:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={uploadImages}
          disabled={uploading}
          className="sr-only"
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-sm font-bold text-slate-700">
            {uploading ? `Uploading to Cloud (${progress}%)` : "Add Photos"}
          </p>
          <p className="text-xs text-slate-400">
            {uploading ? "Please wait..." : "Click here to open your library"}
          </p>
        </div>
      </label>

      {uploading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-12 rounded-3xl">
          <div className="w-full max-w-xs space-y-4 text-center">
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">
              Uploading {progress}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
