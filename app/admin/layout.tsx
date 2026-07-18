// app/admin/layout.tsx
import Link from "next/link";
import { signOut } from "@/app/auth/actions"; // Your logout action
import { LogOut, LayoutDashboard, Users, Settings } from "lucide-react"; // Icons

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-8 tracking-tighter">
            Lumina Cloud
          </h2>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <LayoutDashboard size={20} /> Galleries
            </Link>
            <Link
              href="/admin/clients"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <Users size={20} /> Clients
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <Settings size={20} /> Settings
            </Link>
          </nav>
        </div>

        {/* LOGOUT BUTTON AT THE BOTTOM */}
        <form
          action={signOut}
          className="mt-auto pt-6 border-t border-white/10"
        >
          <button
            type="submit"
            className="flex items-center gap-3 p-3 w-full rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 transition group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </form>
      </aside>

      <main className="flex-1 bg-slate-50 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
