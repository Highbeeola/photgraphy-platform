"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toggleGuestFavorite } from "@/app/gallery/actions";
import GuestLoginModal from "./GuestLoginModal";

export default function FavoriteButton({
  photoId,
  galleryId,
  isInitiallyFavorited,
}: any) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [showModal, setShowModal] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if the guest has "logged in" with their email yet
    const savedEmail = localStorage.getItem("guest_email");

    if (!savedEmail) {
      setShowModal(true);
      return;
    }

    setIsFavorited(!isFavorited);
    await toggleGuestFavorite(photoId, galleryId, savedEmail);
  };

  const handleModalLogin = (email: string) => {
    localStorage.setItem("guest_email", email);
    setShowModal(false);
    // Perform the initial favorite now that we have the email
    setIsFavorited(true);
    toggleGuestFavorite(photoId, galleryId, email);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={`p-2.5 rounded-full transition-all active:scale-75 ${isFavorited ? "bg-white text-red-500" : "bg-black/20 text-white"}`}
      >
        <Heart size={18} className={isFavorited ? "fill-current" : ""} />
      </button>

      <GuestLoginModal isOpen={showModal} onLogin={handleModalLogin} />
    </>
  );
}
