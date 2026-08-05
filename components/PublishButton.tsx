"use client";

import { useTransition } from "react";
import { updateGallerySettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Globe, GlobeLock } from "lucide-react";
import { cn } from "@/lib/utils"; // Assumes standard Next.js cn helper (clsx + tailwind-merge)

export default function PublishButton({
  galleryId,
  isPublic,
}: {
  galleryId: string;
  isPublic: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await updateGallerySettings(galleryId, {
        is_public: !isPublic,
      });
      if (result?.error) {
        toast.error("Failed to update status: " + result.error);
      } else {
        toast.success(
          isPublic ? "Gallery is now a Draft" : "Gallery is now Live!",
        );
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50",
        isPublic
          ? "bg-emerald-500 text-white hover:bg-red-500 hover:shadow-red-200" // Turns red on hover to signal 'Unpublish'
          : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100",
      )}
    >
      {isPending ? (
        "..."
      ) : (
        <>
          {isPublic ? <GlobeLock size={14} /> : <Globe size={14} />}
          {isPublic ? "Live / Unpublish" : "Draft / Publish"}
        </>
      )}
    </button>
  );
}
