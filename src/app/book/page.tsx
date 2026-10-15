import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { openSlots, SESSION_MINUTES, type Rule, type Busy } from "@/lib/slots";
import BookingCalendar from "@/components/BookingCalendar";

export const metadata: Metadata = { title: "Schedule a free consultation" };
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const supabase = await createClient();
  const [{ data: rules }, { data: busy }] = await Promise.all([
    supabase.from("availability_rules").select("*").eq("active", true),
    supabase.from("public_busy").select("*"),
  ]);
  // one slot list per session length; the client switches between them as the family picks a type
  const slotsByType = Object.fromEntries(
    Object.entries(SESSION_MINUTES).map(([t, m]) => [t, openSlots({ rules: (rules ?? []) as Rule[], busy: (busy ?? []) as Busy[], minutes: m })]),
  );
  return (
    <section>
      <div className="wrap">
        <div className="center stack" style={{ justifyItems: "center", marginBottom: "2rem" }}>
          <span className="eyebrow">Schedule</span>
          <h2>Pick a time that works for your family</h2>
          <p className="lead">These are Lindsay&apos;s real open times for the next three weeks. Choose a day, then a time. She confirms every request personally within one business day.</p>
        </div>
        <BookingCalendar slotsByType={slotsByType} />
      </div>
    </section>
  );
}
