import { createClient } from "@/lib/supabase/server";
import { Mail, Calendar, MessageSquare, CheckCircle } from "lucide-react";

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Booking Inquiries
        </h1>
        <p className="text-slate-500">
          Respond to potential clients who contacted you.
        </p>
      </div>

      <div className="grid gap-6">
        {bookings?.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition group relative"
          >
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-xl">{booking.client_name}</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    {booking.session_type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={16} className="text-slate-300" />
                    <a
                      href={`mailto:${booking.client_email}`}
                      className="hover:text-blue-600 underline underline-offset-4"
                    >
                      {booking.client_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={16} className="text-slate-300" />
                    <span>
                      Received on{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl flex gap-4">
                  <MessageSquare
                    size={20}
                    className="text-slate-300 shrink-0 mt-1"
                  />
                  <p className="text-slate-600 leading-relaxed italic">
                    "{booking.message}"
                  </p>
                </div>
              </div>

              <div className="flex lg:flex-col gap-2 justify-center lg:justify-start">
                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition">
                  <CheckCircle size={16} /> Mark as Done
                </button>
              </div>
            </div>
          </div>
        ))}

        {bookings?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-3xl text-slate-400">
            No inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
}
