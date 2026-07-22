"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GalleryPasswordGateway({
  galleryId,
}: {
  galleryId: string;
}) {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We just refresh the page with the password in the URL (simple & fast)
    router.push(`/gallery/${galleryId}?pw=${password}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif italic mb-2 text-slate-900 font-light tracking-tight">
        Protected Gallery
      </h1>
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-8">
        Please enter the access code
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Code"
          className="w-full p-4 border-b border-slate-200 text-center outline-none focus:border-black transition text-xl tracking-widest"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-widest"
        >
          Enter Gallery
        </button>
      </form>
    </div>
  );
}
