// app/admin/layout.tsx
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ExternalLink,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. If not logged in at all, go to login
  if (!user) redirect("/login");

  // 2. Fetch role to ensure it's Dara (Photographer)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "photographer") {
    redirect("/portal"); // Send clients to the portal, not admin
  }

  // We've removed Clients and Bookings to focus on the core: Galleries
  const navItems = [
    { label: "Galleries", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white p-6 flex-col fixed h-full shadow-2xl">
        <div className="mb-10 px-2">
          <h2 className="text-xl font-serif italic tracking-tighter text-white">
            Dara Pixel
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">
            Studio Manager
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white"
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}

          {/* THE PRO "VIEW SITE" LINK */}
          <Link
            href="/portfolio"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-500/10 transition-all text-slate-400 hover:text-blue-400 mt-4 border-t border-white/5 pt-6"
          >
            <ExternalLink size={18} />
            <span className="text-sm font-medium">View Live Site</span>
          </Link>
        </nav>

        {/* SIGN OUT AT BOTTOM */}
        <form action={signOut} className="pt-6 border-t border-white/5">
          <button
            type="submit"
            className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </form>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* --- MOBILE BOTTOM NAV (Simplified) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-6 py-4 flex justify-center gap-20 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-black transition-colors"
          >
            <item.icon size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {item.label}
            </span>
          </Link>
        ))}
        <Link
          href="/portfolio"
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Globe size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Site
          </span>
        </Link>
      </nav>
    </div>
  );
}
