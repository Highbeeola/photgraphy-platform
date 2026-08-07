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
  const [hasError, setHasError] = useState(false);

  // CLOUDINARY LOADER: This tells Cloudinary to only send the pixels needed
  const cloudinaryLoader = ({
    src: loaderSrc,
    width: nextWidth,
    quality,
  }: any) => {
    if (loaderSrc.includes("res.cloudinary.com")) {
      const params = [
        `w_${width || nextWidth}`,
        "c_limit",
        `q_${quality || "auto"}`,
        "f_auto",
      ];
      return loaderSrc.replace("/upload/", `/upload/${params.join(",")}/`);
    }
    return loaderSrc;
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-slate-50 overflow-hidden rounded-sm">
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100 animate-pulse z-10 flex items-center justify-center"
          >
            <div className="w-6 h-6 bg-slate-200 rounded-full opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>

      {hasError && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-[8px] uppercase tracking-widest text-slate-300">
          Load Error
        </div>
      )}

      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.03 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          loader={cloudinaryLoader}
          src={src}
          alt={alt || "Photography item"}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </motion.div>
    </div>
  );
}
