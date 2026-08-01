"use client";

import { useState, useTransition } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteGallery } from "@/app/admin/actions";
import { toast } from "sonner";

export default function DeleteGalleryButton({
  galleryId,
  galleryTitle,
}: {
  galleryId: string;
  galleryTitle: string;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGallery(galleryId);
      if (result?.error) {
        toast.error("Delete failed: " + result.error);
        setIsConfirming(false);
      } else {
        toast.success(`"${galleryTitle}" deleted permanently.`);
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm Delete?"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="p-2 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setIsConfirming(true);
      }}
      className="p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-xl backdrop-blur-md shadow-xl transition-all active:scale-90"
    >
      <Trash2 size={18} />
    </button>
  );
}
