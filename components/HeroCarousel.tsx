"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image, { ImageLoader } from "next/image";
import { ArrowRight } from "lucide-react";

interface HeroCarouselProps {
  photos: { url: string }[];
}

// Cloudinary loader function to transform image URLs on demand
const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  if (src.includes("/upload/")) {
    return src.replace(
      "/upload/",
      `/upload/w_${width},q_${quality || "auto"},f_auto/`,
    );
  }
  return src;
};

export default function HeroCarousel({ photos }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos]);

  // Fallback if no photos are starred yet
  if (photos.length === 0) {
    return (
      <div className="w-full h-[70vh] bg-slate-100 flex items-center justify-center text-slate-400 italic font-serif">
        Select "Feature" on photos in your dashboard to populate the section.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden bg-white rounded-sm shadow-sm">
      {photos.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Relative wrapper anchors the fill image cleanly */}
          <div className="relative w-full h-full">
            <Image
              loader={cloudinaryLoader}
              src={photo.url}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-[50%_15%]"
              alt="Photography Hero"
            />
            <div className="absolute inset-0 bg-black/20 z-20" />
          </div>
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-30">
        <h2 className="text-4xl md:text-7xl font-serif italic tracking-tighter drop-shadow-2xl mb-4">
          Preserving the Soul
        </h2>

        <Link
          href="/portfolio"
          className="mt-8 flex items-center gap-4 group bg-white/10 backdrop-blur-md border border-white/30 px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-500"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-black">
            Explore Portfolio
          </span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="absolute bottom-10 left-10 right-10 flex gap-2 z-30">
        {photos.map((_, i) => (
          <div key={i} className="h-[2px] flex-1 bg-white/20 overflow-hidden">
            <div
              className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${
                i === current ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
