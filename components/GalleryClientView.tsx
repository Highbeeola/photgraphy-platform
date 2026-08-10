"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  Download,
  Sun,
  Moon,
} from "lucide-react";
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

  // Lightbox UI state
  const [hideControls, setHideControls] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lightboxTheme, setLightboxTheme] = useState<"dark" | "light">("dark");

  // Swipe state
  const touchStartX = useRef(0);
  const ignoreSwipe = useRef(false);

  // Pinch state
  const initialPinchDistance = useRef<number | null>(null);
  const initialZoomScale = useRef(1);

  // Image dragging state
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);
  const isDraggingImage = useRef(false);

  // Prevent touch gestures from triggering click afterwards
  const wasTouchGesture = useRef(false);

  // Track whether the image is actively being dragged
  const [isDragging, setIsDragging] = useState(false);

  // ---------------------------------------------------------
  // RESET IMAGE POSITION / ZOOM WHEN PHOTO CHANGES
  // ---------------------------------------------------------
  useEffect(() => {
    setZoomScale(1);
    setTranslateX(0);
    setTranslateY(0);
    initialPinchDistance.current = null;
    initialZoomScale.current = 1;

    isDraggingImage.current = false;
    setIsDragging(false);
  }, [selectedImageIndex]);

  // ---------------------------------------------------------
  // PRELOAD ADJACENT IMAGES
  // ---------------------------------------------------------
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const preload = (index: number) => {
      if (index < 0 || index >= photos.length) return;

      const img = new Image();
      img.src = photos[index].url;
    };

    preload(selectedImageIndex - 1);
    preload(selectedImageIndex + 1);
  }, [selectedImageIndex, photos]);

  // ---------------------------------------------------------
  // LOCK BODY SCROLL WHEN LIGHTBOX IS ACTIVE
  // ---------------------------------------------------------
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
      setHideControls(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImageIndex]);

  // ---------------------------------------------------------
  // KEYBOARD NAVIGATION
  // ---------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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

  // ---------------------------------------------------------
  // DOUBLE-TAP ZOOM
  // ---------------------------------------------------------
  const handleToggleZoom = () => {
    if (zoomScale === 1) {
      setZoomScale(2.2);
    } else {
      setZoomScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }
  };

  // ---------------------------------------------------------
  // PINCH DISTANCE
  // ---------------------------------------------------------
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // ---------------------------------------------------------
  // VIEWPORT CLICK
  // ---------------------------------------------------------
  const handleViewportClick = () => {
    if (wasTouchGesture.current) {
      wasTouchGesture.current = false;
      return;
    }
    setHideControls((prev) => !prev);
  };

  // ---------------------------------------------------------
  // TOUCH START
  // ---------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    // TWO FINGERS = PINCH
    if (e.touches.length === 2) {
      wasTouchGesture.current = true;
      ignoreSwipe.current = true;
      isDraggingImage.current = false;
      setIsDragging(false);

      initialPinchDistance.current = getTouchDistance(e.touches);
      initialZoomScale.current = zoomScale;

      return;
    }

    // ONE FINGER
    const touch = e.touches[0];

    lastTouchX.current = touch.clientX;
    lastTouchY.current = touch.clientY;

    if (zoomScale > 1) {
      wasTouchGesture.current = true;

      ignoreSwipe.current = true;
      isDraggingImage.current = true;
      setIsDragging(true);

      return;
    }

    ignoreSwipe.current = false;
    isDraggingImage.current = false;
    setIsDragging(false);

    touchStartX.current = touch.clientX;
  };

  // ---------------------------------------------------------
  // TOUCH MOVE
  // ---------------------------------------------------------
  const handleTouchMove = (e: React.TouchEvent) => {
    // PINCH ZOOM
    if (e.touches.length === 2) {
      wasTouchGesture.current = true;

      ignoreSwipe.current = true;
      isDraggingImage.current = false;
      setIsDragging(false);

      if (initialPinchDistance.current !== null) {
        const currentDistance = getTouchDistance(e.touches);

        const scaleChange = currentDistance / initialPinchDistance.current;

        const newScale = Math.min(
          Math.max(initialZoomScale.current * scaleChange, 1),
          4,
        );

        setZoomScale(newScale);
      }

      return;
    }

    // DRAG ZOOMED IMAGE
    if (zoomScale > 1 && isDraggingImage.current) {
      wasTouchGesture.current = true;

      const touch = e.touches[0];

      const deltaX = touch.clientX - lastTouchX.current;
      const deltaY = touch.clientY - lastTouchY.current;

      setTranslateX((prev) => prev + deltaX);
      setTranslateY((prev) => prev + deltaY);

      lastTouchX.current = touch.clientX;
      lastTouchY.current = touch.clientY;

      return;
    }
  };

  // ---------------------------------------------------------
  // TOUCH END
  // ---------------------------------------------------------
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistance.current = null;
    }

    if (isDraggingImage.current) {
      isDraggingImage.current = false;
      setIsDragging(false);

      return;
    }

    if (ignoreSwipe.current) {
      return;
    }

    const touchEndX = e.changedTouches[0]?.clientX;

    if (touchEndX === undefined) return;

    const distance = touchStartX.current - touchEndX;

    if (distance > 80) {
      handleNext();
    } else if (distance < -80) {
      handlePrev();
    }
  };

  // ---------------------------------------------------------
  // TOUCH CANCEL
  // ---------------------------------------------------------
  const handleTouchCancel = () => {
    initialPinchDistance.current = null;
    isDraggingImage.current = false;
    setIsDragging(false);

    ignoreSwipe.current = true;
  };

  // ---------------------------------------------------------
  // DOWNLOAD
  // ---------------------------------------------------------
  const handleDownload = async (originalUrl: string) => {
    try {
      const res = await fetch(originalUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = blobUrl;

      a.download = `${gallery.title.replace(/\s+/g, "-")}-${
        (selectedImageIndex ?? 0) + 1
      }.jpg`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  // ---------------------------------------------------------
  // FAVORITES
  // ---------------------------------------------------------
  const executeBulkFavorite = async (email: string) => {
    const photoIds = photos.map((p) => p.id);
    const slug = gallery.slug || gallery.id;
    toast.promise(
      async () => {
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

  // ---------------------------------------------------------
  // FILE NAME
  // ---------------------------------------------------------
  const getFileName = (path: string) => {
    if (!path) return "";
    const name = path.split("/").pop() || "";

    return name.length > 20 ? `${name.substring(0, 17)}...` : name;
  };

  const isDark = lightboxTheme === "dark";

  // FIXED: Added backticks around template string
  const imageTransform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoomScale})`;

  return (
    // FIXED: Wrapped in React Fragment <>
    <>
      {/* HEADER */}
      <div className="text-center py-20 space-y-6">
        <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
          {gallery.title}
        </h1>

        <p className="text-[10px] uppercase tracking-[0.6em] text-slate-400">
          Collection
        </p>

        <div className="flex justify-center items-center gap-8 pt-4">
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <CopyLinkButton galleryId={gallery.id} />

            <span className="text-[9px] uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition">
              Share
            </span>
          </div>

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

      {/* GALLERY */}
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

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[99999] w-full h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-300 ${
              isDark ? "bg-black" : "bg-white"
            }`}
          >
            {/* TOP BAR */}
            <AnimatePresence>
              {!hideControls && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`absolute top-0 inset-x-0 p-4 md:p-6 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-[100000] ${
                    isDark
                      ? "bg-gradient-to-b from-black/90 via-black/40 to-transparent"
                      : "bg-gradient-to-b from-white/90 via-white/40 to-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={() => {
                        setSelectedImageIndex(null);
                        setZoomScale(1);
                        setTranslateX(0);
                        setTranslateY(0);
                      }}
                      className={`p-2 transition ${
                        isDark
                          ? "text-white/80 hover:text-white"
                          : "text-slate-700 hover:text-black"
                      }`}
                    >
                      <X size={22} />
                    </button>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isDark ? "text-white/60" : "text-slate-500"
                        }`}
                      >
                        {selectedImageIndex + 1} / {photos.length}
                      </span>

                      {photos[selectedImageIndex]?.storage_path && (
                        <>
                          <span
                            className={`text-[10px] ${
                              isDark ? "text-white/20" : "text-slate-300"
                            }`}
                          >
                            •
                          </span>

                          <span
                            className={`text-[10px] font-mono tracking-tight hidden sm:inline-block ${
                              isDark ? "text-white/40" : "text-slate-400"
                            }`}
                          >
                            {getFileName(
                              photos[selectedImageIndex].storage_path,
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2">
                    {gallery.allow_download !== false && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          handleDownload(photos[selectedImageIndex].url);
                        }}
                        className={`px-3.5 py-2 md:px-4 md:py-2 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                          isDark
                            ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                        }`}
                        title="Download High-Res Photo"
                      >
                        <Download size={13} strokeWidth={2.5} />

                        <span className="hidden sm:inline">Download</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setLightboxTheme((prev) =>
                          prev === "dark" ? "light" : "dark",
                        );
                      }}
                      className={`p-2 rounded-full transition ${
                        isDark
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                      title="Toggle background contrast"
                    >
                      {isDark ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    <CopyLinkButton
                      galleryId={gallery.id}
                      variant={isDark ? "minimal-white" : "minimal-dark"}
                    />

                    {gallery.allow_favorites !== false && (
                      <FavoriteButton
                        photoId={photos[selectedImageIndex].id}
                        galleryId={gallery.id}
                        isInitiallyFavorited={initialFavorites.some(
                          (f) => f.photo_id === photos[selectedImageIndex].id,
                        )}
                        variant={isDark ? "glass" : "glass-dark"}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IMAGE VIEWPORT */}
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden touch-none"
              onClick={handleViewportClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <img
                src={photos[selectedImageIndex].url}
                onDoubleClick={(e) => {
                  e.stopPropagation();

                  handleToggleZoom();
                }}
                style={{
                  transform: imageTransform,

                  transition: isDragging ? "none" : "transform 180ms ease-out",

                  transformOrigin: "center center",

                  willChange: "transform",
                }}
                className="w-full h-auto max-h-[88dvh] md:max-h-[85vh] object-contain select-none block mx-auto"
                alt="Preview"
                draggable={false}
              />
            </div>

            {/* NAVIGATION ARROWS */}
            <AnimatePresence>
              {!hideControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handlePrev();
                      }}
                      className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 transition-all z-[100000] p-2 md:p-4 rounded-full backdrop-blur-sm ${
                        isDark
                          ? "bg-black/30 text-white/70 hover:text-white"
                          : "bg-white/30 text-slate-700 hover:text-black"
                      }`}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={28} className="md:w-10 md:h-10" />
                    </button>
                  )}

                  {selectedImageIndex < photos.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleNext();
                      }}
                      className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 transition-all z-[100000] p-2 md:p-4 rounded-full backdrop-blur-sm ${
                        isDark
                          ? "bg-black/30 text-white/70 hover:text-white"
                          : "bg-white/30 text-slate-700 hover:text-black"
                      }`}
                      aria-label="Next photo"
                    >
                      <ChevronRight size={28} className="md:w-10 md:h-10" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
