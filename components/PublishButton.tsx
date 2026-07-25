"use client";

import { useTransition } from "react";
import { updateGallerySettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Globe, GlobeLock } from "lucide-react";

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
      className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 ${
        isPublic
          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
          : "bg-[#00c2a0] text-white hover:bg-[#00ad8e]"
      }`}
    >
      {isPending ? (
        <span className="animate-pulse">Processing...</span>
      ) : (
        <>
          {isPublic ? <GlobeLock size={14} /> : <Globe size={14} />}
          {isPublic ? "Unpublish" : "Publish"}
        </>
      )}
    </button>
  );
}
