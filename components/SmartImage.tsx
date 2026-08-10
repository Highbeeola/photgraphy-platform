"use client";

import Image from "next/image";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function SmartImage({
  src,
  alt,
  width = 1200,
  height = 800,
  priority = false,
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
      const transformation = `w_${nextWidth},c_limit,q_auto:eco,f_auto`;
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
    return loaderSrc;
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-100 rounded-xl">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse z-10" />
      )}

      {hasError && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-[8px] uppercase tracking-widest text-slate-300">
          Load Error
        </div>
      )}

      {!hasError && (
        <Image
          loader={cloudinaryLoader}
          src={src}
          alt={alt || "Photography item"}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.02] ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
