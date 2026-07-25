"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CopyLinkButton({ galleryId }: { galleryId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    // This is the direct link Dara sends on WhatsApp
    const url = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="p-2 hover:bg-slate-200 rounded-lg transition"
    >
      {copied ? (
        <Check size={16} className="text-green-600" />
      ) : (
        <Share2 size={16} />
      )}
    </button>
  );
}
