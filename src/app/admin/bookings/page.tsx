import { tutorContext, type Booking } from "@/lib/data";
import { childOptions } from "@/lib/admin-data";
import BookingRow from "@/components/BookingRow";

export default async function Bookings({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "upcoming" } = await searchParams;
  const { supabase } = await tutorContext();
  let q = supabase.from("bookings").select("*");
  q = show === "past" ? q.lt("ends_at", new Date().toISOString()).order("starts_at", { ascending: false }).limit(100) : q.gte("ends_at", new Date().toISOString()).order("starts_at");
  const [{ data }, opts] = await Promise.all([q, childOptions()]);
  return (
    <div className="card">
      <div className="toolbar-row">
        <h3 style={{ margin: 0 }}>Bookings</h3>
        <div className="seg" style={{ maxWidth: 220 }}>
          <a className={"btn ghost sm" + (show !== "past" ? " on" : "")} href="/admin/bookings" style={{ border: 0, borderRadius: 0, background: show !== "past" ? "var(--ink)" : "var(--bg)", color: show !== "past" ? "#fff" : "var(--ink)" }}>Upcoming</a>
          <a className="btn ghost sm" href="/admin/bookings?show=past" style={{ border: 0, borderRadius: 0, background: show === "past" ? "var(--ink)" : "var(--bg)", color: show === "past" ? "#fff" : "var(--ink)" }}>Past</a>
        </div>
      </div>
      {!data?.length && <p className="hint">Nothing here yet.</p>}
      <div className="list">{(data as Booking[] | null)?.map((b) => <BookingRow key={b.id} b={b} childOptions={opts} />)}</div>
    </div>
  );
}
