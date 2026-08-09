"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Mail } from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";
import FavoriteButton from "./FavoriteButton";
import SmartImage from "@/components/SmartImage";
import { toast } from "sonner";
import { bulkFavorite } from "@/app/gallery/actions";

interface Gallery {
  id: string;
  slug?: string;
  title: string;
  event_date?: string;
  allow_favorites?: boolean;
  allow_download?: boolean;
}

interface Photo {
  id: string;
  url: string;
  storage_path: string;
}

interface Favorite {
  photo_id: string;
}

interface GalleryClientViewProps {
  gallery: Gallery;
  photos: Photo[];
  initialFavorites?: Favorite[];
  user?: any;
}

export default function GalleryClientView({
  gallery,
  photos,
  initialFavorites = [],
  user,
}: GalleryClientViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  const handleNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < photos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleDownload = async (originalUrl: string) => {
    try {
      const res = await fetch(originalUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${gallery.title.replace(/\s+/g, "-")}-${(selectedImageIndex ?? 0) + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const executeBulkFavorite = async (email: string) => {
    const photoIds = photos.map((p) => p.id);
    const slug = gallery.slug || gallery.id;

    toast.promise(
      async () => {
        // Pass photoIds, email, gallery.id, AND slug:
        const result = await bulkFavorite(photoIds, email, gallery.id, slug);

        if (result?.error) {
          throw new Error(result.error);
        }

        return result;
      },
      {
        loading: "Saving collection to your favorites...",
        success: "All photos favorited!",
        error: (err: any) => `Could not save: ${err?.message || "Try again."}`,
      },
    );
  };

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;

    localStorage.setItem("guest_email", guestEmail);
    setShowGuestModal(false);
    await executeBulkFavorite(guestEmail);
  };

  const handleFavoriteAll = async () => {
    const savedEmail = localStorage.getItem("guest_email");

    if (!savedEmail) {
      setShowGuestModal(true);
      return;
    }

    await executeBulkFavorite(savedEmail);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SINGLE HEADER & CONTROLS SECTION */}
      <div className="text-center py-20 space-y-6">
        <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
          {gallery.title}
        </h1>
        <p className="text-[10px] uppercase tracking-[0.6em] text-slate-400">
          Collection
        </p>

        <div className="flex justify-center items-center gap-8 pt-4">
          {/* SHARE BUTTON */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <CopyLinkButton galleryId={gallery.id} />
            <span className="text-[9px] uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition">
              Share
            </span>
          </div>

          {/* GRID FAVORITE ALL BUTTON */}
          {gallery.allow_favorites !== false && (
            <button
              onClick={handleFavoriteAll}
              className="flex flex-col items-center gap-2 group cursor-pointer transition-all"
            >
              <div className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Heart
                  size={16}
                  className="text-slate-800 group-hover:text-red-500 transition-colors"
                />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">
                Favorite All
              </span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-2 md:px-4 pb-20">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-4 cursor-zoom-in"
              onClick={() => setSelectedImageIndex(index)}
            >
              <SmartImage src={photo.url} alt={gallery.title} />
            </div>
          ))}
        </div>
      </main>

      {/* GUEST EMAIL MODAL */}
      <AnimatePresence>
        {showGuestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative space-y-6 shadow-2xl">
              <button
                onClick={() => setShowGuestModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-black transition"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Heart size={20} />
                </div>
                <h3 className="text-xl font-serif italic">Save Favorites</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your email address to save your favorite selections in
                  this gallery.
                </p>
              </div>

              <form onSubmit={handleModalLogin} className="space-y-4">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-black transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition shadow-lg"
                >
                  Save & Favorite All
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black w-full h-screen flex flex-col items-center justify-center touch-none select-none"
          >
            {/* TOP BAR */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-[100] bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="text-white/70 hover:text-white p-2 transition"
                >
                  <X size={24} />
                </button>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                  {selectedImageIndex + 1} / {photos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CopyLinkButton
                  galleryId={gallery.id}
                  variant="minimal-white"
                />

                {gallery.allow_favorites !== false && (
                  <FavoriteButton
                    photoId={photos[selectedImageIndex].id}
                    galleryId={gallery.id}
                    isInitiallyFavorited={initialFavorites.some(
                      (f) => f.photo_id === photos[selectedImageIndex].id,
                    )}
                    variant="glass"
                  />
                )}
              </div>
            </div>

            {/* LIGHTBOX IMAGE */}
            <motion.div
              key={selectedImageIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleNext();
                if (info.offset.x > 50) handlePrev();
              }}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <img
                src={photos[selectedImageIndex].url}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl select-none pointer-events-none"
                alt="Preview"
              />
            </motion.div>

            {/* ARROWS */}
            <div className="hidden md:block">
              {selectedImageIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all z-[100]"
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
              )}
              {selectedImageIndex < photos.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all z-[100]"
                >
                  <ChevronRight size={48} strokeWidth={1} />
                </button>
              )}
            </div>

            {/* DOWNLOAD BUTTON */}
            {gallery.allow_download !== false && (
              <div className="absolute bottom-10 z-[100]">
                <button
                  onClick={() => handleDownload(photos[selectedImageIndex].url)}
                  className="bg-white text-black px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition"
                >
                  Download High-Res
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
