import Link from "next/link";
import { tutorContext, type Booking } from "@/lib/data";
import { childOptions } from "@/lib/admin-data";
import BookingRow from "@/components/BookingRow";
import { partsIn, zonedToUtc, TUTOR_TZ } from "@/lib/slots";

export default async function AdminHome() {
  const { supabase } = await tutorContext();
  const now = new Date();
  const p = partsIn(now, TUTOR_TZ);
  const dayStart = zonedToUtc(p.y, p.m, p.d, 0, 0, TUTOR_TZ).toISOString();
  const weekEnd = zonedToUtc(p.y, p.m, p.d + 7, 0, 0, TUTOR_TZ).toISOString();
  const [{ data: pending }, { data: week }, opts] = await Promise.all([
    supabase.from("bookings").select("*").eq("status", "pending").order("starts_at"),
    supabase.from("bookings").select("*").eq("status", "confirmed").gte("starts_at", dayStart).lt("starts_at", weekEnd).order("starts_at"),
    childOptions(),
  ]);
  return (
    <div className="stack">
      <div className="card">
        <div className="toolbar-row"><h3 style={{ margin: 0 }}>New requests</h3><Link href="/admin/bookings" className="hint">All bookings</Link></div>
        {!pending?.length && <p className="hint">Nothing waiting. New requests show up here and in your email.</p>}
        <div className="list">{(pending as Booking[] | null)?.map((b) => <BookingRow key={b.id} b={b} childOptions={opts} />)}</div>
      </div>
      <div className="card">
        <h3>This week</h3>
        {!week?.length && <p className="hint">No confirmed sessions in the next seven days.</p>}
        <div className="list">{(week as Booking[] | null)?.map((b) => <BookingRow key={b.id} b={b} childOptions={opts} />)}</div>
      </div>
    </div>
  );
}
