"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import type { PhotoSwipeOptions } from "photoswipe";
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
  // Optional: if you ever store real dimensions in the DB, pass them here
  // and the lightbox will be exact from the very first frame.
  width?: number;
  height?: number;
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

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface GalleryClientViewProps {
  gallery: GalleryData;
  photos: Photo[];
  initialFavorites?: Favorite[];
  user?: User | null;
}

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                */
/* ------------------------------------------------------------------ */

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 1600;
// PhotoSwipe only needs the correct ASPECT RATIO, so every measured size is
// normalised to this width. Zoom levels below are relative to "fit", so the
// absolute number doesn't matter.
const NORMAL_WIDTH = 2000;
const THEME_KEY = "gallery_lightbox_theme";

const normalizeDims = (w: number, h: number) => ({
  width: NORMAL_WIDTH,
  height: Math.round((NORMAL_WIDTH * h) / w),
});

const isCloudinary = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes("/upload/");

const withTransform = (url: string, t: string) =>
  isCloudinary(url) ? url.replace("/upload/", `/upload/${t}/`) : url;

// Small image: used for the lightbox open animation placeholder + size probing
const thumbUrl = (url: string) =>
  withTransform(url, "w_400,c_limit,q_auto,f_auto");
// Capped image: what the lightbox actually displays (much lighter than the raw original)
const fullUrl = (url: string) =>
  withTransform(url, "w_2400,c_limit,q_auto,f_auto");

const getSavedEmail = (user?: User | null) =>
  user?.email ||
  (typeof window !== "undefined" ? localStorage.getItem("guest_email") : null);

const svg = (inner: string) =>
  `<svg class="pswp-tb-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  share: svg(
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  ),
  download: svg(
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  ),
  theme: svg(
    '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  ),
  heart: svg(
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  ),
};

type Dims = { width: number; height: number };
type ToggleResult = "ok" | "error" | "needs-email";

interface Actions {
  photos: Photo[];
  download: (photo: Photo) => Promise<void>;
  share: (photo: Photo) => Promise<void>;
  toggleFavorite: (
    photoId: string,
    emailOverride?: string,
  ) => Promise<ToggleResult>;
}

export default function GalleryClientView({
  gallery,
  photos,
  initialFavorites = [],
  user,
}: GalleryClientViewProps) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  // What the guest was trying to do when we asked for their email
  const pendingRef = useRef<string | "ALL" | null>(null);

  /* ---------------- Photo dimensions (batched) ---------------- */
  const [photoDimensions, setPhotoDimensions] = useState<Record<string, Dims>>(
    {},
  );
  const knownDimsRef = useRef<Record<string, Dims>>({});
  const dimsBufferRef = useRef<Record<string, Dims>>({});
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDimensions = useCallback(
    (photoId: string, width: number, height: number) => {
      if (!width || !height) return;
      if (knownDimsRef.current[photoId] || dimsBufferRef.current[photoId])
        return;
      dimsBufferRef.current[photoId] = normalizeDims(width, height);
      if (flushTimerRef.current) return;
      // Batch updates so 100+ images loading doesn't re-render the grid 100+ times
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        const batch = dimsBufferRef.current;
        dimsBufferRef.current = {};
        knownDimsRef.current = { ...knownDimsRef.current, ...batch };
        setPhotoDimensions(knownDimsRef.current);
      }, 120);
    },
    [],
  );

  useEffect(
    () => () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    },
    [],
  );

  // Probe sizes of photos that haven't rendered yet (below the fold) so the
  // lightbox opens with the right aspect ratio on EVERY slide, not just the
  // ones already loaded. Uses tiny Cloudinary thumbnails, 4 at a time.
  useEffect(() => {
    const missing = photos.filter(
      (p) => !(p.width && p.height) && isCloudinary(p.url),
    );
    if (!missing.length) return;
    let cancelled = false;
    let next = 0;

    const worker = async () => {
      while (!cancelled && next < missing.length) {
        const p = missing[next++];
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            if (!cancelled)
              handleDimensions(p.id, img.naturalWidth, img.naturalHeight);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = thumbUrl(p.url);
        });
      }
    };

    for (let i = 0; i < 4; i++) worker();
    return () => {
      cancelled = true;
    };
  }, [photos, handleDimensions]);

  const getDims = (p: Photo): Dims | undefined =>
    p.width && p.height
      ? normalizeDims(p.width, p.height)
      : photoDimensions[p.id];

  /* ---------------- Favorites: ONE source of truth ---------------- */
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialFavorites.map((f) => f.photo_id)),
  );
  const favoritedIdsRef = useRef<Set<string>>(favoriteIds);
  const lightboxRef = useRef<any>(null);

  const commitFavorites = (next: Set<string>) => {
    favoritedIdsRef.current = next;
    setFavoriteIds(next);
  };

  // Keep the lightbox heart in sync when favorites change while it's open
  useEffect(() => {
    const pswp = lightboxRef.current;
    if (!pswp?.element) return;
    const btn = pswp.element.querySelector(".pswp__button--favorite");
    const p = photos[pswp.currIndex];
    btn?.classList.toggle(
      "pswp__button--favorited",
      !!p && favoriteIds.has(p.id),
    );
  }, [favoriteIds, photos]);

  const toggleFavorite = async (
    photoId: string,
    emailOverride?: string,
  ): Promise<ToggleResult> => {
    const email = emailOverride || getSavedEmail(user);
    if (!email) {
      pendingRef.current = photoId;
      setShowGuestModal(true);
      return "needs-email";
    }

    const wasFav = favoritedIdsRef.current.has(photoId);
    const next = new Set(favoritedIdsRef.current);
    if (wasFav) next.delete(photoId);
    else next.add(photoId);
    commitFavorites(next); // optimistic

    try {
      await toggleGuestFavorite(photoId, gallery.id, email);
      return "ok";
    } catch {
      const rollback = new Set(favoritedIdsRef.current); // undo
      if (wasFav) rollback.add(photoId);
      else rollback.delete(photoId);
      commitFavorites(rollback);
      toast.error("Failed to update favorite");
      return "error";
    }
  };

  /* ---------------- Download / Share / Bulk favorite ---------------- */
  const handleDownload = async (photo: Photo) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    const filename = `${gallery.title.replace(/\s+/g, "-")}-photo-${index + 1}.jpg`;
    try {
      // Cloudinary: let the server force a download of the TRUE original
      // (no CORS issues, works on iOS Safari)
      if (isCloudinary(photo.url)) {
        const a = document.createElement("a");
        a.href = photo.url.replace("/upload/", "/upload/fl_attachment/");
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      const res = await fetch(photo.url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (photo: Photo) => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/gallery/${gallery.slug || gallery.id}?photo=${photo.id}`
        : photo.url;

    if (navigator.share) {
      try {
        await navigator.share({ title: gallery.title, url: shareUrl });
      } catch (err) {
        // User cancelled share
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

  const executeBulkFavorite = async (email: string) => {
    const request = bulkFavorite(
      photos.map((p) => p.id),
      email,
      gallery.id,
      gallery.slug || gallery.id,
    );
    toast.promise(request, {
      loading: "Saving favorites...",
      success: "All photos favorited!",
      error: "Failed to save favorites.",
    });
    try {
      await request;
      commitFavorites(new Set(photos.map((p) => p.id)));
    } catch {
      // toast.promise already showed the error
    }
  };

  const handleFavoriteAll = async () => {
    const savedEmail = getSavedEmail(user);
    if (!savedEmail) {
      pendingRef.current = "ALL";
      setShowGuestModal(true);
      return;
    }
    await executeBulkFavorite(savedEmail);
  };

  const submitGuestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = guestEmail.trim();
    localStorage.setItem("guest_email", email);
    setShowGuestModal(false);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending === "ALL") await executeBulkFavorite(email);
    else if (pending) await toggleFavorite(pending, email);
  };

  const cancelGuestModal = () => {
    pendingRef.current = null;
    setShowGuestModal(false);
  };

  /* ---------------- PhotoSwipe UI ---------------- */
  // PhotoSwipe registers its UI elements once, so handlers must never close
  // over React state. They call through this ref, which always points at the
  // latest functions.
  const actionsRef = useRef<Actions | null>(null);
  useEffect(() => {
    actionsRef.current = {
      photos,
      download: handleDownload,
      share: handleShare,
      toggleFavorite,
    };
  });

  // Toolbar: [share][download][theme][favorite] ---------- [counter][close]
  // (orders 1-4 sit before PhotoSwipe's counter which is order 5)
  const uiElements = useMemo(
    () => [
      {
        name: "share",
        order: 1,
        isButton: true,
        tagName: "button",
        title: "Share",
        ariaLabel: "Share photo",
        html: ICONS.share,
        onClick: (_e: any, _el: any, pswp: any) => {
          const p = actionsRef.current?.photos[pswp.currIndex];
          if (p) actionsRef.current?.share(p);
        },
      },
      ...(gallery.allow_download !== false
        ? [
            {
              name: "download",
              order: 2,
              isButton: true,
              tagName: "button",
              title: "Download",
              ariaLabel: "Download photo",
              html: ICONS.download,
              onClick: (_e: any, _el: any, pswp: any) => {
                const p = actionsRef.current?.photos[pswp.currIndex];
                if (p) actionsRef.current?.download(p);
              },
            },
          ]
        : []),
      {
        name: "theme",
        order: 3,
        isButton: true,
        tagName: "button",
        title: "Toggle theme",
        ariaLabel: "Toggle light or dark background",
        html: ICONS.theme,
        onClick: (_e: any, _el: any, pswp: any) => {
          const root = pswp.element as HTMLElement;
          const next =
            root.getAttribute("data-theme") === "light" ? "dark" : "light";
          root.setAttribute("data-theme", next);
          try {
            localStorage.setItem(THEME_KEY, next);
          } catch {}
        },
      },
      ...(gallery.allow_favorites !== false
        ? [
            {
              name: "favorite",
              order: 4,
              isButton: true,
              tagName: "button",
              title: "Favorite",
              ariaLabel: "Favorite photo",
              html: ICONS.heart,
              onInit: (el: HTMLElement, pswp: any) => {
                const sync = () => {
                  const p = actionsRef.current?.photos[pswp.currIndex];
                  el.classList.toggle(
                    "pswp__button--favorited",
                    !!p && favoritedIdsRef.current.has(p.id),
                  );
                };
                pswp.on("change", sync);
                sync();
              },
              onClick: async (_e: any, _el: any, pswp: any) => {
                const p = actionsRef.current?.photos[pswp.currIndex];
                if (!p || !actionsRef.current) return;
                const result = await actionsRef.current.toggleFavorite(p.id);
                // No email yet: close the lightbox so the email modal is visible
                if (result === "needs-email") pswp.close();
              },
            },
          ]
        : []),
      {
        name: "spacer",
        order: 4.5, // between favorite (4) and the counter (5)
        onInit: (el: HTMLElement) => {
          el.style.flex = "1 1 auto";
        },
      },
    ],
    [gallery.allow_download, gallery.allow_favorites],
  );

  const handleOpen = (pswp: any) => {
    lightboxRef.current = pswp;
    let theme = "dark";
    try {
      theme = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {}
    pswp.element?.setAttribute("data-theme", theme);
    pswp.on("destroy", () => {
      lightboxRef.current = null;
    });
  };

  // Zoom levels are multiples of "fit" so they feel the same on every phone and
  // every photo, regardless of image pixel size.
  const lightboxOptions: PhotoSwipeOptions = {
    zoom: false,
    bgOpacity: 1,
    closeOnVerticalDrag: true, // swipe down to dismiss
    allowPanToNext: true,
    wheelToZoom: true,
    // double-tap toggles between fit and this level
    secondaryZoomLevel: (z) => z.fit * 2.5,
    maxZoomLevel: (z) => z.fit * 6,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-white">
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

      <main className="max-w-[1600px] mx-auto px-4 pb-24">
        <Gallery
          uiElements={uiElements as any}
          options={lightboxOptions}
          onOpen={handleOpen}
        >
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {photos.map((photo, index) => {
              const dims = getDims(photo);
              return (
                <Item
                  key={photo.id}
                  original={fullUrl(photo.url)}
                  thumbnail={thumbUrl(photo.url)}
                  width={dims?.width || DEFAULT_WIDTH}
                  height={dims?.height || DEFAULT_HEIGHT}
                  alt={gallery.title}
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
                        width={dims?.width}
                        height={dims?.height}
                        priority={index < 4}
                        onDimensions={(w, h) =>
                          handleDimensions(photo.id, w, h)
                        }
                      />

                      {gallery.allow_favorites !== false && (
                        <div
                          className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FavoriteButton
                            photoId={photo.id}
                            isFavorited={favoriteIds.has(photo.id)}
                            onToggle={(id: string) => {
                              toggleFavorite(id);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Item>
              );
            })}
          </div>
        </Gallery>
      </main>

      {showGuestModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-serif italic">Save your favorites</h3>
            <p className="text-xs text-slate-500">
              Please enter your email to save your favorited photos.
            </p>
            <form onSubmit={submitGuestEmail} className="space-y-3">
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                autoFocus
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelGuestModal}
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
