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
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Create New Gallery
      </h2>

      <form
        ref={formRef}
        action={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Gallery Title
          </label>
          <input
            name="title"
            placeholder="e.g. The Smith Wedding"
            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Date
          </label>
          <input
            name="eventDate"
            type="date"
            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Access PIN (Optional)
          </label>
          <input
            name="password"
            placeholder="e.g. 1234"
            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white h-[50px] rounded-xl font-bold text-sm hover:bg-slate-800 transition active:scale-95"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </form>
    </section>
  );
}
