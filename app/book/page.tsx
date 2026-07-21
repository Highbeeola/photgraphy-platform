"use client";

import { submitBooking } from "./actions";
import { toast } from "sonner";
import { useRef } from "react";

export default function BookingPage() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    const result = await submitBooking(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Inquiry sent! I will get back to you soon.");
      formRef.current?.reset();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-serif italic">Book a Session</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Tell me about your vision, and let's create something beautiful.
          </p>
        </div>

        {/* ADD THE ACTION HERE */}
        <form ref={formRef} action={handleAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Name
              </label>
              <input
                name="name"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Email
              </label>
              <input
                name="email"
                type="email"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Session Type
            </label>
            <select
              name="type"
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition bg-white"
            >
              <option>Wedding</option>
              <option>Portrait</option>
              <option>Editorial</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Message
            </label>
            <textarea
              name="message"
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            Send Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
