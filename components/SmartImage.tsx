"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onDimensions?: (width: number, height: number) => void;
}

export default function SmartImage({
  src,
  alt,
  width,
  height,
  priority,
  onDimensions,
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const cloudinaryLoader = ({
    src: loaderSrc,
    width: nextWidth,
  }: {
    src: string;
    width: number;
  }) => {
    if (loaderSrc.includes("res.cloudinary.com")) {
      const parts = loaderSrc.split("/upload/");
      const transformation = `w_${nextWidth},c_limit,q_auto,f_auto`;
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
    return loaderSrc;
  };

  const handleLoaded = (img: HTMLImageElement) => {
    setIsLoaded(true);
    if (onDimensions && img.naturalWidth && img.naturalHeight) {
      onDimensions(img.naturalWidth, img.naturalHeight);
    }
  };

  // If the image was already cached, `onLoad` can fire before React hydrates,
  // which would leave it stuck at opacity-0. Catch that case here.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) handleLoaded(img);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full bg-slate-100 overflow-hidden rounded-sm">
      {hasError ? (
        <div className="min-h-[200px] w-full bg-slate-50 flex items-center justify-center text-[8px] uppercase tracking-widest text-slate-300">
          Load Error
        </div>
      ) : (
        <Image
          ref={imgRef}
          loader={cloudinaryLoader}
          src={src}
          alt={alt || "Photo"}
          // Real aspect ratio when known, so tiles don't jump when they load
          width={width || 1200}
          height={height || 1600}
          // NOTE: `unoptimized` removed. When it is set, Next ignores the loader
          // above, so every tile downloaded the full-resolution original.
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`w-full h-auto object-contain transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={(e) => handleLoaded(e.currentTarget)}
          onError={() => setHasError(true)}
        />
      )}

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />
      )}
    </div>
  );
}
