"use client";

import { useState, useEffect } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
        <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className="relative group break-inside-avoid rounded-sm overflow-hidden bg-slate-50 cursor-zoom-in"
            >
              {/* Integrated SmartImage component with smooth load blur */}
              <SmartImage src={photo.url} alt={gallery.title} width={600} />

              <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <FavoriteButton
                  photoId={photo.id}
                  galleryId={gallery.id}
                  isInitiallyFavorited={initialFavorites.some(
                    (f) => f.photo_id === photo.id,
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {currentIndex !== null && (
        <div
          onClick={() => setCurrentIndex(null)}
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300 select-none"
        >
          {/* Close Button */}
          <button
            onClick={() => setCurrentIndex(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition z-10"
          >
            <X size={32} />
          </button>

          {/* Only show PREV if we aren't at the start */}
          {currentIndex > 0 && (
            <button
              onClick={showPrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2 z-10 hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft size={44} />
            </button>
          )}

          {/* Current Photo */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-full max-h-[85vh]"
          >
            <img
              src={photos[currentIndex].url}
              className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm pointer-events-auto"
              alt=""
            />

            <button
              onClick={() => handleDownload(photos[currentIndex].url)}
              className="mt-6 bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex gap-2 items-center hover:bg-slate-200 transition active:scale-95"
            >
              <Download size={16} /> Download High Res
            </button>
          </div>

          {/* Only show NEXT if we aren't at the end */}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={showNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2 z-10 hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight size={44} />
            </button>
          )}

          {/* Counter Indicator */}
          <div className="absolute bottom-6 text-white/40 text-xs font-mono tracking-widest">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
