"use client";

import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/gallery/actions";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export default function FavoriteButton({
  photoId,
  galleryId,
  isInitiallyFavorited,
}: {
  photoId: string;
  galleryId: string;
  isInitiallyFavorited: boolean;
}) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic UI update: make it red immediately!
    setIsFavorited(!isFavorited);

    startTransition(async () => {
      await toggleFavorite(photoId, galleryId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition active:scale-90"
    >
      <Heart
        size={20}
        className={cn(
          isFavorited ? "fill-red-500 stroke-red-500" : "stroke-white",
        )}
      />
    </button>
  );
}
