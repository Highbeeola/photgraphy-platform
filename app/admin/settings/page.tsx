import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the photographer's profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500">
          Configure your studio profile and brand identity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t pt-10">
        <div>
          <h2 className="font-bold text-lg">Studio Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            This information will be visible to your clients and on your public
            portfolio.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Full Name
              </label>
              <input
                defaultValue={profile?.full_name}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Studio Name
              </label>
              <input
                placeholder="e.g. Lens & Light Studio"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Email Address
            </label>
            <input
              value={user?.email}
              disabled
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
            />
          </div>

          <button className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
