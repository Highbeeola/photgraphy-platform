"use client";

import { createGallery } from "./actions";
import { toast } from "sonner";
import { useRef, useTransition } from "react";

export default function CreateGalleryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createGallery(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Gallery created!");
        formRef.current?.reset();
      }
    });
  }

  return (
    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold mb-8 text-slate-800 tracking-tight">
        Create New Collection
      </h2>

      <form
        ref={formRef}
        action={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-4 items-end"
      >
        {/* Title: 4 columns */}
        <div className="md:col-span-4 space-y-2">
          <label
            htmlFor="gallery-title"
            className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 ml-1"
          >
            Gallery Title
          </label>
          <input
            id="gallery-title"
            name="title"
            placeholder="e.g. The Smith Wedding"
            className="w-full h-12 px-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-1 focus:ring-black transition-all"
            required
          />
        </div>

        {/* Date: 3 columns */}
        <div className="md:col-span-3 space-y-2">
          <label
            htmlFor="gallery-event-date"
            className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 ml-1"
          >
            Event Date
          </label>
          <input
            id="gallery-event-date"
            name="eventDate"
            type="date"
            className="w-full h-12 px-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-1 focus:ring-black transition-all appearance-none flex items-center text-sm"
          />
        </div>

        {/* PIN: 2 columns */}
        <div className="md:col-span-2 space-y-2">
          <label
            htmlFor="gallery-pin"
            className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 ml-1"
          >
            Access PIN
          </label>
          <input
            id="gallery-pin"
            name="password"
            placeholder="0000"
            className="w-full h-12 px-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-1 focus:ring-black transition-all text-center font-mono"
          />
        </div>

        {/* Category: 3 columns */}
        <div className="md:col-span-3 space-y-2">
          <label
            htmlFor="gallery-category"
            className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 ml-1"
          >
            Category
          </label>
          <input
            id="gallery-category"
            name="category"
            list="category-suggestions"
            defaultValue="Lifestyle"
            className="w-full h-12 px-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-1 focus:ring-black transition-all"
          />
          <datalist id="category-suggestions">
            <option value="Lifestyle" />
            <option value="Wedding" />
            <option value="Portrait" />
            <option value="Event" />
          </datalist>
        </div>

        {/* Submit Button: Full width on mobile, right-aligned on desktop */}
        <div className="md:col-span-12 flex justify-end mt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-12 h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 shadow-xl disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Collection"}
          </button>
        </div>
      </form>
    </section>
  );
}
