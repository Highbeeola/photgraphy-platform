"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import SmartImage from "@/components/SmartImage";

interface Gallery {
  id: string;
  title: string;
  event_date?: string;
}

interface Photo {
  id: string;
  url: string;
  storage_path: string;
}

interface Favorite {
  photo_id: string;
}

export default function GalleryView({
  gallery,
  photos,
  initialFavorites = [],
}: {
  gallery: Gallery;
  photos: Photo[];
  initialFavorites?: Favorite[];
}) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // STOP at the last photo
    if (currentIndex !== null && currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // STOP at the first photo
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") setCurrentIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handleDownload = async (originalUrl: string) => {
    try {
      // Fetch original URL directly without transformation flags
      const res = await fetch(originalUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${gallery.title.replace(/\s+/g, "-")}-${(currentIndex ?? 0) + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">
          {gallery.title}
        </h1>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] mt-4">
          Collection
        </p>
      </header>

      <main className="max-w-[1600px] mx-auto px-2 md:px-4 pb-20">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-4 cursor-zoom-in"
              onClick={() => setCurrentIndex(index)}
            >
              {/* SmartImage now has the relative and aspect classes inside it */}
              <SmartImage src={photo.url} alt={gallery.title} />
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {currentIndex !== null && (
        <div
          onClick={() => setCurrentIndex(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 select-none"
        >
          {/* TOP BAR: Glassmorphism style */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/50 to-transparent"
          >
            <span className="text-white/70 text-[10px] uppercase tracking-[0.3em] font-bold">
              {currentIndex + 1} / {photos.length}
            </span>
            <div className="flex gap-4 items-center">
              <FavoriteButton
                photoId={photos[currentIndex].id}
                galleryId={gallery.id}
                isInitiallyFavorited={initialFavorites.some(
                  (f) => f.photo_id === photos[currentIndex].id,
                )}
                variant="glass"
              />
              <button
                onClick={() => setCurrentIndex(null)}
                className="text-white/70 hover:text-white p-2 transition"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Only show PREV if we aren't at the start */}
          {currentIndex > 0 && (
            <button
              onClick={showPrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2 z-[110] hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft size={44} />
            </button>
          )}

          {/* Current Photo */}
          <img
            onClick={(e) => e.stopPropagation()}
            src={photos[currentIndex].url}
            className="max-w-full max-h-[75vh] object-contain shadow-2xl animate-reveal pointer-events-auto"
            alt="Full view"
          />

          {/* Only show NEXT if we aren't at the end */}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={showNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2 z-[110] hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight size={44} />
            </button>
          )}

          {/* BOTTOM BAR: Actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-10 flex flex-col items-center gap-6 z-[110]"
          >
            <button
              onClick={() => handleDownload(photos[currentIndex].url)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
            >
              Download High-Res
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
