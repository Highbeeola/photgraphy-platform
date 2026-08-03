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
    let completed = 0;

    try {
      for (const file of Array.from(files)) {
        // Delay between uploads to give mobile connections breathing room
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 1. Create a unique path
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${galleryId}/${fileName}`;

        const uploadOptions = {
          cacheControl: "3600",
          upsert: false, // Prevents accidental overwrites
          contentType: file.type,
        };

        // 2. Upload with 1-time retry on failure
        let { error: uploadError } = await supabase.storage
          .from("galleries")
          .upload(filePath, file, uploadOptions);

        if (uploadError) {
          console.warn(
            "Upload failed, attempting 1-time retry...",
            uploadError,
          );

          // Wait 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const retryResult = await supabase.storage
            .from("galleries")
            .upload(filePath, file, uploadOptions);

          uploadError = retryResult.error;
        }

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

        // UPDATE PROGRESS UI
        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      }

      toast.success(`${files.length} images delivered successfully!`);
      await refreshGallery(galleryId);
      window.location.reload(); // Force hard refresh to see new images
    } catch (error: any) {
      console.error("Full Error Object:", error);
      toast.error("Upload paused. Check your connection.");
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input value so re-selecting the same file works as expected
      e.target.value = "";
    }
  };

  return (
    <div className="relative group">
      {/* Label trigger */}
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

      {/* Progress Overlay */}
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
