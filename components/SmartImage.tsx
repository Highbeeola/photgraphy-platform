"use client";
import Image from "next/image";

import { useState } from "react";

interface SmartImageProps {
  src: string;

  alt?: string;

  width?: number;
}

export default function SmartImage({ src, alt, width }: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [hasError, setHasError] = useState(false);

  const cloudinaryLoader = ({
    src: loaderSrc,

    width: nextWidth,

    quality,
  }: any) => {
    if (loaderSrc.includes("res.cloudinary.com")) {
      const parts = loaderSrc.split("/upload/");

      // THE CHANGE:

      // q_auto:eco -> This uses AI to compress the image even more for thumbnails

      // without visible quality loss on a phone screen.

      const transformation = `w_${nextWidth},c_limit,q_auto:eco,f_auto`;

      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }

    return loaderSrc;
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-100">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
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
          width={width || 1600}
          height={1200}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={`w-full h-auto object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
