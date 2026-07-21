"use client";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { X, Download } from "lucide-react";

// 1. DEFINE TYPES (This fixes the 'any' errors)
interface Photo {
  id: string;
  storage_path: string;
  url: string;
}

interface Gallery {
  id: string;
  title: string;
  event_date?: string;
}

interface Favorite {
  photo_id: string;
}

export default function GalleryClientView({
  gallery,
  photos,
  initialFavorites,
}: {
  gallery: Gallery;
  photos: Photo[];
  initialFavorites: Favorite[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${gallery.title.replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group break-inside-avoid rounded-sm overflow-hidden bg-slate-50"
            >
              <img
                src={photo.url}
                className="w-full h-auto cursor-zoom-in hover:opacity-90 transition duration-500"
                onClick={() => setSelectedImage(photo.url)}
                loading="lazy"
              />
              <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
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

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            className="max-w-full max-h-[80vh] object-contain shadow-2xl"
          />
          <button
            onClick={() => handleDownload(selectedImage)}
            className="mt-8 bg-white text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex gap-2 items-center hover:bg-slate-200 transition"
          >
            <Download size={16} /> Download High Res
          </button>
        </div>
      )}
    </div>
  );
}
