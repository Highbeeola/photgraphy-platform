"use client";
import { useState } from "react";

export default function GuestLoginModal({
  isOpen,
  onLogin,
}: {
  isOpen: boolean;
  onLogin: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-10 space-y-8 animate-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif italic uppercase tracking-tighter">
            Favorites
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Save your favorite photos and revisit them anytime using your email
            address. This list will be shared with the photographer.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email);
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Your email address"
            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:ring-1 focus:ring-black transition"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
