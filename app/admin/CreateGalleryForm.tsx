"use client";

import { createGallery } from "./actions";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import { useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white px-6 py-2 rounded-md hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:bg-slate-400 cursor-pointer disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create Gallery"}
    </button>
  );
}

export default function CreateGalleryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createGallery(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Gallery created successfully!");
      formRef.current?.reset();
    }
  }

  return (
    <section className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Create New Gallery
      </h2>
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex flex-wrap gap-4"
      >
        <input
          name="title"
          placeholder="e.g. The Smith Wedding"
          className="p-2 border rounded-md flex-1 min-w-[200px] outline-none focus:ring-2 focus:ring-black"
          required
        />
        <input
          name="eventDate"
          type="date"
          className="p-2 border rounded-md outline-none focus:ring-2 focus:ring-black"
        />
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <input name="isPublic" type="checkbox" className="w-4 h-4" />
          <span>Show in Portfolio</span>
        </label>
        <SubmitButton />
      </form>
    </section>
  );
}
