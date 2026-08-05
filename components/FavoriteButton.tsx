"use client";

import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/gallery/actions";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  photoId: string;
  galleryId: string;
  isInitiallyFavorited: boolean;
  variant?: "default" | "glass";
}

export default function FavoriteButton({
  photoId,
  galleryId,
  isInitiallyFavorited,
  variant = "default",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 1. Mobile Haptic Vibration
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      window.navigator.vibrate(10);
    }

    const nextState = !isFavorited;

    // 2. Optimistic UI update
    setIsFavorited(nextState);

    // 3. Toast feedback
    if (nextState) {
      toast.success("Added to Favorites", { duration: 1500 });
    }

    startTransition(async () => {
      await toggleFavorite(photoId, galleryId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "p-2.5 rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center",
        variant === "glass"
          ? "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
          : "bg-black/30 backdrop-blur-md hover:bg-black/50 text-white",
      )}
    >
      <Heart
        size={18}
        className={cn(
          "transition-all duration-300 ease-out",
          isFavorited
            ? "fill-red-500 stroke-red-500 scale-110 animate-in zoom-in-50 duration-300"
            : "stroke-white fill-transparent scale-100 hover:scale-110",
        )}
      />
    </button>
  );
}
