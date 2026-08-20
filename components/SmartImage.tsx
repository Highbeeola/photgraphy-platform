"use client";

import Image from "next/image";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
  priority?: boolean;
}

export default function SmartImage({
  src,
  alt,
  width,
  priority,
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  return (
    <div className="relative w-full bg-slate-100 overflow-hidden rounded-sm">
      {hasError ? (
        <div className="min-h-[200px] w-full bg-slate-50 flex items-center justify-center text-[8px] uppercase tracking-widest text-slate-300">
          Load Error
        </div>
      ) : (
        <Image
          loader={cloudinaryLoader}
          src={src}
          alt={alt || "Photo"}
          width={width || 1200}
          height={1600}
          unoptimized
          priority={priority}
          sizes="(max-width: 768px) 50vw, 33vw"
          className={`w-full h-auto object-contain transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />
      )}
    </div>
  );
}
