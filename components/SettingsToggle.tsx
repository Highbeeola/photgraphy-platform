"use client";

import { useTransition, useState } from "react";
import { updateGallerySettings } from "@/app/admin/actions";
import { toast } from "sonner";

interface Props {
  galleryId: string;
  label: string;
  field: "allow_download" | "allow_favorites";
  initialValue: boolean;
}

export default function SettingsToggle({
  galleryId,
  label,
  field,
  initialValue,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(initialValue);

  const handleToggle = () => {
    // 1. Mobile Haptic
    if ("vibrate" in navigator) window.navigator.vibrate(10);

    const nextState = !isActive;

    // 2. Start the server transition
    startTransition(async () => {
      setIsActive(nextState); // Immediate UI update

      const result = await updateGallerySettings(galleryId, {
        [field]: nextState,
      });

      if (result?.error) {
        setIsActive(!nextState); // REVERT if database fails
        toast.error("Security Block: " + result.error);
      } else {
        toast.success(`${label} ${nextState ? "Enabled" : "Disabled"}`);
      }
    });
  };

  return (
    <div className="flex justify-between items-center group">
      <span
        className={`text-xs font-bold uppercase transition-colors ${isActive ? "text-slate-900" : "text-slate-400"}`}
      >
        {label}
      </span>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-10 h-5 rounded-full transition-all relative ${
          isPending ? "opacity-50 cursor-wait" : "cursor-pointer"
        } ${isActive ? "bg-[#d4af37]" : "bg-slate-300"}`} // Using your Gold color
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
            isActive ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
