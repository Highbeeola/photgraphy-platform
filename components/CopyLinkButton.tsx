"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  galleryId: string;
  variant?: "default" | "minimal-white" | "minimal-dark";
}

export default function CopyLinkButton({
  galleryId,
  variant = "default",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    // This is the direct link Dara sends on WhatsApp
    const url = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Minimal white variant for Dark Lightbox overlay
  if (variant === "minimal-white") {
    return (
      <button
        onClick={copy}
        className="text-white/70 hover:text-white p-2 transition flex items-center gap-2"
        aria-label="Share Gallery"
      >
        {copied ? (
          <Check size={18} className="text-emerald-400" />
        ) : (
          <Share2 size={18} />
        )}
      </button>
    );
  }

  // Minimal dark variant for Light Lightbox overlay
  if (variant === "minimal-dark") {
    return (
      <button
        onClick={copy}
        className="text-slate-700 hover:text-black p-2 transition flex items-center gap-2"
        aria-label="Share Gallery"
      >
        {copied ? (
          <Check size={18} className="text-emerald-600" />
        ) : (
          <Share2 size={18} />
        )}
      </button>
    );
  }

  // Default variant for Admin dashboards / tables
  return (
    <button
      onClick={copy}
      className="p-2 hover:bg-slate-200 rounded-lg transition"
      aria-label="Copy Link"
    >
      {copied ? (
        <Check size={16} className="text-green-600" />
      ) : (
        <Share2 size={16} />
      )}
    </button>
  );
}
