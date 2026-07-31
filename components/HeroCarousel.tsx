"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroCarouselProps {
  photos: { url: string }[];
}

export default function HeroCarousel({ photos }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos]);

  // Fallback if Dara hasn't starred any photos yet
  if (photos.length === 0) {
    return (
      <div className="w-full h-[70vh] bg-slate-100 flex items-center justify-center text-slate-400 italic font-serif">
        Select "Feature" on photos in your dashboard to populate the section.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[calc(100vh-120px)] overflow-hidden bg-white rounded-sm shadow-sm">
      {photos.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={photo.url}
            /* THE HEAD FIX: object-[50%_15%] keeps faces in frame on desktop */
            className="w-full h-full object-cover object-[50%_15%] grayscale-[5%] transition-transform duration-[10000ms]"
            style={{ transform: index === current ? "scale(1)" : "scale(1.1)" }}
            alt="Dara Pixel Work"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
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

      <div className="absolute bottom-10 left-10 right-10 flex gap-2 z-20">
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
