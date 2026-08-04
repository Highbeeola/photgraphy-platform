"use client";

import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
}

export default function SmartImage({ src, alt }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  // Grid thumbnails should be smaller to save bandwidth
  const optimizedSrc = src.replace(
    "/upload/",
    `/upload/w_800,c_scale,q_auto,f_auto/`,
  );

  return (
    <img
      src={optimizedSrc}
      alt={alt || "Gallery Image"}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`object-cover w-full h-full transition-all duration-700 ${
        loaded ? "blur-0 scale-100" : "blur-xl scale-110"
      }`}
    />
  );
}
