// app/admin/layout.tsx
import { signOut } from "@/app/auth/actions";
import {
  LayoutDashboard,
  Users,
  Settings,
  CalendarCheck,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { label: "Galleries", href: "/admin", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white p-6 flex-col fixed h-full">
        <h2 className="text-xl font-bold mb-10 tracking-tighter">
          Lumina Cloud
        </h2>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <form action={signOut} className="pt-6 border-t border-white/10">
          <button
            type="submit"
            className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </form>
      </aside>

      {/* --- MAIN CONTENT (Adjusted padding for mobile) --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAV (Visible only on Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-black"
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
