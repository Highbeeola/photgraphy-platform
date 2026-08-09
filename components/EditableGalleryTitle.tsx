"use client";

import { updateGallerySettings } from "@/app/admin/actions";

interface EditableGalleryTitleProps {
  id: string;
  initialTitle: string;
}

export default function EditableGalleryTitle({
  id,
  initialTitle,
}: EditableGalleryTitleProps) {
  return (
    <form
      action={async (formData) => {
        const newTitle = formData.get("title") as string;
        if (newTitle && newTitle !== initialTitle) {
          await updateGallerySettings(id, { title: newTitle });
        }
      }}
    >
      <input
        name="title"
        defaultValue={initialTitle}
        onBlur={(e) => e.target.form?.requestSubmit()}
        className="w-full p-2 border-b border-transparent hover:border-slate-200 focus:border-black bg-transparent font-serif italic text-xl outline-none transition-all"
      />
    </form>
  );
}
