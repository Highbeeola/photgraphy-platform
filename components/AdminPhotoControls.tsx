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

  const handleAction = (
    fn: any,
    stateSetter?: any,
    newState?: any,
    actionName?: string,
  ) => {
    if (stateSetter) stateSetter(newState);
    startTransition(async () => {
      const res = await fn;
      if (res?.error) {
        toast.error(res.error);
      } else if (actionName) {
        // Professional feedback for mobile users
        toast.success(actionName, { duration: 2000 });
      }
    });
  };

  return (
    <div className="flex items-center w-full h-full">
      {/* 1. HERO */}
      <button
        onClick={() =>
          handleAction(
            toggleHeroStatus(photoId, !isHero),
            setIsHero,
            !isHero,
            isHero ? "Removed from Carousel" : "Added to Carousel",
          )
        }
        disabled={isPending}
        title="Display in Home Carousel"
        className={`flex-1 flex justify-center items-center h-full transition-colors ${
          isHero
            ? "text-blue-400 bg-blue-500/10"
            : "text-white/30 hover:text-white"
        }`}
      >
        <Home size={18} fill={isHero ? "currentColor" : "none"} />
      </button>

      {/* 2. FEATURED */}
      <button
        onClick={() =>
          handleAction(
            togglePhotoFeature(photoId, !isFeatured),
            setIsFeatured,
            !isFeatured,
            isFeatured ? "Removed from Featured" : "Added to Featured",
          )
        }
        disabled={isPending}
        title="Feature on Homepage"
        className={`flex-1 flex justify-center items-center h-full border-x border-white/10 transition-colors ${
          isFeatured
            ? "text-amber-400 bg-amber-500/10"
            : "text-white/30 hover:text-white"
        }`}
      >
        <Star size={18} fill={isFeatured ? "currentColor" : "none"} />
      </button>

      {/* 3. COVER */}
      <button
        onClick={() =>
          handleAction(
            setGalleryCover(galleryId, storagePath),
            null,
            null,
            "Set as Gallery Cover",
          )
        }
        disabled={isPending}
        title="Set as Main Cover"
        className={`flex-1 flex justify-center items-center h-full transition-colors ${
          isCurrentCover
            ? "text-green-400 bg-green-500/10"
            : "text-white/30 hover:text-white"
        }`}
      >
        <ImageIcon size={18} />
      </button>
    </div>
  );
}
