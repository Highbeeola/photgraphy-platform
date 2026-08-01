"use client";

import { useState, useTransition } from "react";
import { Home, Star, Image as ImageIcon } from "lucide-react";
import {
  toggleHeroStatus,
  togglePhotoFeature,
  setGalleryCover,
} from "@/app/admin/actions";
import { toast } from "sonner";

export default function AdminPhotoControls({
  photoId,
  galleryId,
  storagePath,
  initialIsHero,
  initialIsFeatured,
  isCurrentCover,
}: {
  photoId: string;
  galleryId: string;
  storagePath: string;
  initialIsHero: boolean;
  initialIsFeatured: boolean;
  isCurrentCover: boolean;
}) {
  const [isHero, setIsHero] = useState(initialIsHero);
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isPending, startTransition] = useTransition();

  const handleAction = (fn: any, stateSetter?: any, newState?: any) => {
    if (stateSetter) stateSetter(newState);
    startTransition(async () => {
      const res = await fn;
      if (res?.error) toast.error(res.error);
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full h-full">
      {/* 1. HERO (Home Icon) */}
      <button
        onClick={() =>
          handleAction(toggleHeroStatus(photoId, !isHero), setIsHero, !isHero)
        }
        disabled={isPending}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${isHero ? "text-blue-400 bg-blue-500/20" : "text-white/40 hover:text-white"}`}
      >
        <Home size={16} fill={isHero ? "currentColor" : "none"} />
      </button>

      {/* 2. FEATURED (Star Icon) */}
      <button
        onClick={() =>
          handleAction(
            togglePhotoFeature(photoId, !isFeatured),
            setIsFeatured,
            !isFeatured,
          )
        }
        disabled={isPending}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${isFeatured ? "text-amber-400 bg-amber-500/20" : "text-white/40 hover:text-white"}`}
      >
        <Star size={16} fill={isFeatured ? "currentColor" : "none"} />
      </button>

      {/* 3. COVER (Image Icon) */}
      <button
        onClick={() => handleAction(setGalleryCover(galleryId, storagePath))}
        disabled={isPending}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${isCurrentCover ? "text-green-400 bg-green-500/20" : "text-white/40 hover:text-white"}`}
      >
        <ImageIcon size={16} />
      </button>
    </div>
  );
}
