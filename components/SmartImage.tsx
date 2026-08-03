"use client";

import { useState } from "react";

export default function SmartImage({
  src,
  alt,
}: {
  src: string;
  alt?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt || "Gallery Image"}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`object-cover w-full h-full transition-all duration-700 ${
        loaded ? "blur-0 scale-100" : "blur-xl scale-110"
      }`}
    />
  );
}
