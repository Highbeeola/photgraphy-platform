"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
}

export default function SmartImage({ src, alt, width }: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const cloudinaryLoader = ({ src, width: nextWidth, quality }: any) => {
    // If the image is NOT from Cloudinary (like a local placeholder), return as is
    if (!src.includes("res.cloudinary.com")) return src;

    // Split the URL to insert the professional optimizations
    // This version handles URLs with or without version numbers (v123456)
    const parts = src.split("/upload/");

    // f_auto: best format (WebP) | q_auto: best quality/size balance | c_limit: don't upscale
    const transformation = `w_${nextWidth},c_limit,q_auto,f_auto`;

    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  };

  return (
    /* FIX: Added 'relative' and 'aspect-[4/5]' so the image has a box to fill */
    <div className="relative w-full aspect-[4/5] bg-slate-50 overflow-hidden rounded-sm">
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100 animate-pulse z-10"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          loader={cloudinaryLoader}
          src={src}
          alt={alt || "Gallery Image"}
          fill // Keeps the fill logic
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover"
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>
    </div>
  );
}
