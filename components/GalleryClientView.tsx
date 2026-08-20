"use client";

import { useState, useRef } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import SmartImage from "@/components/SmartImage";
import FavoriteButton from "./FavoriteButton";
import CopyLinkButton from "./CopyLinkButton";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { bulkFavorite, toggleGuestFavorite } from "@/app/gallery/actions";

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
  cover_url?: string;
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

  // Track favorited photo ids so the lightbox heart can reflect state per-slide
  const favoritedIdsRef = useRef(
    new Set(initialFavorites.map((f) => f.photo_id)),
  );

  // Download Function
  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${gallery.title.replace(/\s+/g, "-")}-photo.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  // Share Function
  const handleShare = async (photo: Photo) => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/gallery/${gallery.slug || gallery.id}?photo=${photo.id}`
        : photo.url;

    if (navigator.share) {
      try {
        await navigator.share({
          title: gallery.title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled the share sheet — not an error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  // Bulk Favorite Action
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

  // PhotoSwipe Custom UI Elements
  // `name` becomes the CSS class suffix: .pswp__button--{name}
  const uiElements = [
    ...(gallery.allow_download !== false
      ? [
          {
            name: "download",
            order: 8,
            isButton: true,
            tagName: "button",
            title: "Download",
            onClick: (e: any, el: any, pswpInstance: any) => {
              handleDownload(pswpInstance.currSlide.data.src);
            },
          },
        ]
      : []),
    {
      name: "theme",
      order: 9,
      isButton: true,
      tagName: "button",
      title: "Toggle theme",
      onClick: (e: any, el: any, pswpInstance: any) => {
        const root = pswpInstance.element as HTMLElement;
        const isLight = root.getAttribute("data-theme") === "light";
        root.setAttribute("data-theme", isLight ? "dark" : "light");
      },
    },
    ...(gallery.allow_favorites !== false
      ? [
          {
            name: "favorite",
            order: 10,
            isButton: true,
            tagName: "button",
            title: "Favorite",
            onInit: (el: HTMLElement, pswpInstance: any) => {
              const sync = () => {
                const photo = photos[pswpInstance.currIndex];
                el.classList.toggle(
                  "pswp__button--favorited",
                  photo ? favoritedIdsRef.current.has(photo.id) : false,
                );
              };
              pswpInstance.on("change", sync);
              sync();
            },
            onClick: async (e: any, el: any, pswpInstance: any) => {
              const currentPhoto = photos[pswpInstance.currIndex];
              const savedEmail =
                typeof window !== "undefined"
                  ? localStorage.getItem("guest_email")
                  : null;

              if (!savedEmail) {
                pswpInstance.close();
                setShowGuestModal(true);
                return;
              }

              try {
                await toggleGuestFavorite(
                  currentPhoto.id,
                  gallery.id,
                  savedEmail,
                );
                if (favoritedIdsRef.current.has(currentPhoto.id)) {
                  favoritedIdsRef.current.delete(currentPhoto.id);
                } else {
                  favoritedIdsRef.current.add(currentPhoto.id);
                }
                el.classList.toggle(
                  "pswp__button--favorited",
                  favoritedIdsRef.current.has(currentPhoto.id),
                );
                toast.success("Updated favorites");
              } catch (err) {
                toast.error("Failed to update favorite");
              }
            },
          },
        ]
      : []),
    {
      name: "share",
      order: 7,
      isButton: true,
      tagName: "button",
      title: "Share",
      onClick: (e: any, el: any, pswpInstance: any) => {
        const currentPhoto = photos[pswpInstance.currIndex];
        if (currentPhoto) handleShare(currentPhoto);
      },
    },
  ];

  // PhotoSwipe Lightbox Options
  const lightboxOptions = {
    bgOpacity: 1,
    closeOnVerticalDrag: true, // Swipe down to dismiss
    allowPanToNext: true,
    wheelToZoom: true,
    pinchToZoom: true,
    secondaryZoomLevel: 1.5,
    maxZoomLevel: 4,
  } as const;

  return (
    <div className="min-h-screen bg-white">
      {/* COVER HERO */}
      {gallery.cover_url && (
        <div className="relative w-full h-[50vh] min-h-[350px] max-h-[550px] overflow-hidden bg-slate-100">
          <img
            src={gallery.cover_url}
            alt={gallery.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="py-16 px-6 text-center space-y-8">
        <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
          {gallery.title}
        </h1>

        <div className="flex justify-center items-center gap-12">
          <CopyLinkButton galleryId={gallery.id} />

          {gallery.allow_favorites !== false && (
            <button
              onClick={handleFavoriteAll}
              className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
            >
              <div className="p-3 rounded-full border border-slate-200 bg-white group-hover:border-red-200 transition-all shadow-sm">
                <Heart
                  size={20}
                  className="text-slate-400 group-hover:text-red-500 transition-colors"
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 group-hover:text-black">
                Favorite All
              </span>
            </button>
          )}
        </div>
      </header>

      {/* GALLERY GRID */}
      <main className="max-w-[1600px] mx-auto px-4 pb-24">
        <Gallery uiElements={uiElements as any} options={lightboxOptions}>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {photos.map((photo, index) => (
              <Item
                key={photo.id}
                original={photo.url}
                thumbnail={photo.url}
                width={1600}
                height={2400}
              >
                {({ ref, open }) => (
                  <div
                    ref={ref as any}
                    onClick={open}
                    className="mb-4 break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-sm"
                  >
                    <SmartImage
                      src={photo.url}
                      alt={gallery.title}
                      priority={index < 4}
                    />

                    {/* Floating heart on grid */}
                    <div
                      className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
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

      {/* GUEST EMAIL MODAL */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4 shadow-xl">
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
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-slate-800 transition-colors"
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
