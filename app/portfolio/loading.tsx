export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="space-y-4 text-center animate-in fade-in duration-700">
        <h2 className="text-xl font-serif italic tracking-tighter text-slate-900">
          Dara Pixel
        </h2>
        <div className="flex gap-1 justify-center">
          <div className="w-1 h-1 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 bg-slate-200 rounded-full animate-bounce" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300 font-bold">
          Curating Collections
        </p>
      </div>
    </div>
  );
}
