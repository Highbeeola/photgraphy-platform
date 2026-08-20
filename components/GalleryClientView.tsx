"use client";

import { useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import SmartImage from "@/components/SmartImage";
import FavoriteButton from "./FavoriteButton";
import CopyLinkButton from "./CopyLinkButton";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { bulkFavorite } from "@/app/gallery/actions";

// Types
interface Photo {
  id: string;
  url: string;
  storage_path: string;
}

interface Favorite {
  photo_id: string;
}

interface GalleryData {
  id: string;
  slug?: string;
  title: string;
  event_date?: string;
  allow_favorites?: boolean;
  allow_download?: boolean;
}

interface GalleryClientViewProps {
  gallery: GalleryData;
  photos: Photo[];
  initialFavorites?: Favorite[];
}

export default function GalleryClientView({
  gallery,
  photos,
  initialFavorites = [],
}: GalleryClientViewProps) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  // 1. Download Handler
  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${gallery.title.replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  // 2. Favorite All Logic
  const executeBulkFavorite = async (email: string) => {
    toast.promise(
      bulkFavorite(
        photos.map((p) => p.id),
        email,
        gallery.id,
        gallery.slug || gallery.id,
      ),
      {
        loading: "Saving favorites...",
        success: "All photos favorited!",
        error: "Failed to save favorites.",
      },
    );
  };

  const handleFavoriteAll = async () => {
    const savedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("guest_email")
        : null;
    if (!savedEmail) {
      setShowGuestModal(true);
      return;
    }
    await executeBulkFavorite(savedEmail);
  };

  // 3. PhotoSwipe Lightbox Options
  const lightboxOptions = {
    showHideAnimationType: "zoom",
    bgOpacity: 1, // 100% solid black
    closeOnVerticalDrag: true,
    mainClass: "pswp--custom-bg", // Ensures buttons stay visible
  } as const;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER SECTION */}
      <div className="text-center py-20 space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter leading-tight">
            {gallery.title}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.6em] text-slate-400 font-bold">
            Collection
          </p>
        </div>

        {/* UPDATED ACTION BAR */}
        <div className="flex justify-center items-center gap-12 pt-4">
          {/* SHARE BUTTON */}
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <CopyLinkButton galleryId={gallery.id} />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-300 group-hover:text-black transition">
              Share
            </span>
          </div>

          {/* FAVORITE ALL BUTTON */}
          {gallery.allow_favorites !== false && (
            <button
              onClick={handleFavoriteAll}
              className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
            >
              <div className="p-3.5 rounded-full border border-slate-200 bg-white shadow-sm group-hover:border-red-200 group-hover:bg-red-50 transition-all">
                <Heart
                  size={20}
                  className="text-slate-400 group-hover:text-red-500 transition-colors"
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-300 group-hover:text-black transition">
                Favorite All
              </span>
            </button>
          )}
        </div>
      </div>

      {/* PHOTO GRID WITH PHOTOSWIPE */}
      <main className="max-w-[1600px] mx-auto px-4 pb-20">
        <Gallery options={lightboxOptions}>
          {/* columns-2 for mobile, columns-3/4 for desktop. 
              gap-4 ensures photos have room but feel connected. */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo: Photo) => (
              <Item
                key={photo.id}
                original={photo.url}
                thumbnail={photo.url}
                width="1600"
                height="2400"
              >
                {({ ref, open }) => (
                  <div
                    ref={ref as unknown as React.RefObject<HTMLDivElement>}
                    onClick={open}
                    className="break-inside-avoid mb-4 cursor-zoom-in group relative"
                  >
                    <SmartImage src={photo.url} alt={gallery.title} />

                    {/* Floating Heart on Grid */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <FavoriteButton
                        photoId={photo.id}
                        galleryId={gallery.id}
                        isInitiallyFavorited={initialFavorites.some(
                          (f) => f.photo_id === photo.id,
                        )}
                      />
                    </div>
                  </div>
                )}
              </Item>
            ))}
          </div>
        </Gallery>
      </main>

      {/* GUEST MODAL FOR FAVORITE ALL */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-serif italic">Save your favorites</h3>
            <p className="text-xs text-slate-500">
              Please enter your email to save all favorited photos.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("guest_email", guestEmail);
                setShowGuestModal(false);
                executeBulkFavorite(guestEmail);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuestModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-black text-white rounded-lg"
                >
                  Save & Favorite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
