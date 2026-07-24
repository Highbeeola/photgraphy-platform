import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the role to determine if we show "Admin Dashboard" or "Client Access"
  const { data: profile } = user
    ? await supabase.from("users").select("role").eq("id", user.id).single()
    : { data: null };

  const isPhotographer = profile?.role === "photographer";

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-200">
      <nav className="p-12 flex justify-center">
        <h1 className="text-2xl md:text-3xl font-serif italic tracking-tighter uppercase">
          Dara Pixel
        </h1>
      </nav>

      <main className="max-w-screen-xl mx-auto px-6 pb-24">
        <div className="flex flex-col items-center">
          <div className="w-full md:w-[60%] lg:w-[45%] aspect-[2/3] bg-slate-200 relative group overflow-hidden shadow-2xl">
            <img
              src="/hero-signature.jpg"
              alt="Dara Pixel Signature Work"
              className="w-full h-full object-cover transition duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-4 border border-white/10 pointer-events-none" />
          </div>

          <div className="mt-16 text-center max-w-2xl space-y-8 px-4">
            <h2 className="text-4xl md:text-7xl font-serif leading-[1.1] font-light">
              Fine Art <br />
              <span className="italic">Wedding Photography</span>
            </h2>

            <p className="text-slate-500 font-light text-sm md:text-base leading-relaxed tracking-widest max-w-xs mx-auto uppercase">
              Based in the city — available worldwide.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 w-full">
              <Link
                href="/portfolio"
                className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white text-[10px] uppercase tracking-[0.3em] font-black hover:bg-slate-800 transition-all duration-500 active:scale-95 text-center shadow-xl"
              >
                View Portfolio
              </Link>

              <Link
                href={user ? (isPhotographer ? "/admin" : "/portal") : "/login"}
                className="w-full md:w-auto px-12 py-4 border border-slate-900 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-slate-900 hover:text-white transition-all duration-500 active:scale-95 text-center"
              >
                {isPhotographer ? "Admin Dashboard" : "Client Access"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-slate-100 flex flex-col items-center gap-6">
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-300">
          {/* --- THE FOOTER LOGIC --- */}
          {!user ? (
            // If NOT logged in, show this
            <Link href="/login" className="hover:text-black transition">
              Photographer Login
            </Link>
          ) : (
            // If LOGGED IN, show the email and a clear Sign Out
            <div className="flex gap-8 items-center">
              <span className="opacity-20 lowercase font-normal italic">
                [{user.email}]
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="hover:text-red-500 transition cursor-pointer uppercase tracking-widest font-bold"
                >
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-200">
          Copyright © Dara Pixel 2024
        </p>
      </footer>
    </div>
  );
}
