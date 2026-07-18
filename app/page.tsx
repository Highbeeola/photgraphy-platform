import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/auth/actions"; // Import the action

export default async function HomePage() {
  const supabase = await createClient();

  // Check if a user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. The Logged-in Suggestion Bar (Only shows if user is authenticated) */}
      {user && (
        <div className="absolute top-0 w-full bg-white/10 backdrop-blur-md border-b border-white/10 py-2 px-6 z-50 flex justify-between items-center animate-in fade-in slide-in-from-top duration-700">
          <p className="text-xs font-medium tracking-tight opacity-80">
            Logged in as <span className="font-bold">{user.email}</span>
          </p>
          <div className="flex gap-6 items-center">
            <Link
              href="/admin"
              className="text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Dashboard
            </Link>

            {/* Logout Form */}
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />{" "}
        {/* Dark Overlay */}
        <img
          src="https://images.unsplash.com/photo-1492691523567-6170c3295db6?q=80&w=2070&auto=format&fit=crop"
          alt="Photography Hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 3. Navigation */}
      <nav className="relative z-20 flex justify-between items-center p-8 md:px-16">
        <h1 className="text-2xl font-serif italic tracking-tighter">
          Lens & Light
        </h1>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium items-center">
          <Link href="#portfolio" className="hover:opacity-50 transition">
            Portfolio
          </Link>

          {/* If not logged in, show login. If logged in, show a quick link to the dashboard */}
          {!user ? (
            <Link
              href="/login"
              className="hover:opacity-50 transition border-b border-white/20 pb-1"
            >
              Client Login
            </Link>
          ) : (
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition"
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* 4. Hero Content */}
      <main className="relative z-20 flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h2 className="text-5xl md:text-8xl font-serif mb-6 leading-tight animate-in fade-in zoom-in duration-1000">
          Capturing the <br />
          <span className="italic">Soul of the Moment</span>
        </h2>

        <p className="max-w-xl text-lg md:text-xl opacity-70 mb-10 font-light leading-relaxed">
          Preserving your most cherished memories with timeless elegance.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          {/* PRIMARY ACTION */}
          <Link
            href={user ? "/admin" : "/login"}
            className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-slate-200 transition active:scale-95"
          >
            {user ? "View My Collections" : "Enter Client Gallery"}
          </Link>

          {/* SECONDARY ACTION: Only show if NOT logged in */}
          {!user && (
            <Link
              href="/login"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition active:scale-95"
            >
              Photographer Access
            </Link>
          )}
        </div>
      </main>

      {/* 5. Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-50">
        <div className="w-[1px] h-12 bg-white" />
      </div>
    </div>
  );
}
