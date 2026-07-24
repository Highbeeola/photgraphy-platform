"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CopyLinkButton({ galleryId }: { galleryId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop from opening the gallery
    const url = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied for WhatsApp!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="p-2.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl backdrop-blur-md shadow-xl transition-all active:scale-95"
    >
      {copied ? (
        <Check size={18} className="text-green-600" />
      ) : (
        <Share2 size={18} />
      )}
    </button>
  );
}
