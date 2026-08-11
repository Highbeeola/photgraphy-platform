"use client";

import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import SmartImage from "@/components/SmartImage";
import FavoriteButton from "./FavoriteButton";
import CopyLinkButton from "./CopyLinkButton";
import { Heart } from "lucide-react";

// 1. DEFINE MISSING TYPES (Fixes 'Cannot find name' errors)
interface Photo {
  id: string;
  url: string;
  storage_path: string;
}

interface Favorite {
  photo_id: string;
}

interface GalleryData {
  // Renamed from 'Gallery' to avoid collision with <Gallery />
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
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER SECTION */}
      <div className="text-center py-20 space-y-6">
        <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
          {gallery.title}
        </h1>
        <p className="text-[10px] uppercase tracking-[0.6em] text-slate-400">
          Collection
        </p>

        <div className="flex justify-center items-center gap-8 pt-4">
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            {/* FIX: Using the CopyLinkButton so it's not 'unused' */}
            <CopyLinkButton galleryId={gallery.id} />
            <span className="text-[9px] uppercase tracking-widest text-slate-300">
              Share
            </span>
          </div>

          {gallery.allow_favorites !== false && (
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="p-2 hover:bg-slate-50 rounded-lg transition">
                <Heart size={16} className="text-slate-800" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-300">
                Favorite All
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PHOTO GRID WITH PHOTOSWIPE */}
      <main className="max-w-[1600px] mx-auto px-4 pb-20">
        <Gallery options={{ showHideAnimationType: "zoom", bgOpacity: 0.95 }}>
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
    </div>
  );
}
