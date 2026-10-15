"use client";
import { useMemo, useState, useTransition } from "react";
import { groupByDay, SESSION_LABEL, type Slot } from "@/lib/slots";
import { requestBooking } from "@/lib/actions";

const GRADES = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

export default function BookingCalendar({ slotsByType }: { slotsByType: Record<string, Slot[]> }) {
  const [type, setType] = useState("consultation");
  const [format, setFormat] = useState<"in_home" | "online">("in_home");
  const days = useMemo(() => groupByDay(slotsByType[type] ?? []), [slotsByType, type]);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const day = days.find((d) => d.dayKey === dayKey) ?? null;

  function pickType(t: string) { setType(t); setSlot(null); }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    if (!slot) { setErr("Choose a day and time first."); return; }
    const fd = new FormData(e.currentTarget);
    fd.set("starts_at", slot.starts_at); fd.set("type", type); fd.set("format", format);
    const child = String(fd.get("child_name") ?? ""), grade = String(fd.get("child_grade") ?? "");
    start(async () => {
      const r = await requestBooking(fd);
      if (r.ok) setDone(`${SESSION_LABEL[type]} for ${child} (${grade}) on ${day?.label} at ${slot.label}, ${format === "online" ? "online" : "in-home"}.`);
      else setErr(r.error);
    });
  }

  if (done) {
    return (
      <div className="card confirm" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="big">You&apos;re on the calendar, pending Lindsay&apos;s confirmation.</div>
        <p>{done}</p>
        <p className="hint">We emailed you a copy. Lindsay will confirm the same day, with directions or your session link.</p>
        <button className="btn ghost sm" type="button" onClick={() => { setDone(null); setSlot(null); }}>Book another time</button>
      </div>
    );
  }

  return (
    <div className="sched">
      <div className="card">
        <h3>Availability</h3>
        <label className="field" style={{ marginBottom: ".8rem" }}>What would you like to book?
          <select value={type} onChange={(e) => pickType(e.target.value)} id="bkType">
            {Object.entries(SESSION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        {days.length === 0 ? <p className="hint">No open times in the next three weeks. Email Lindsaykgagnon@gmail.com and she will find a time.</p> : (
          <div className="days" role="listbox" aria-label="Choose a day">
            {days.map((d) => (
              <button key={d.dayKey} type="button" role="option" aria-selected={d.dayKey === dayKey} className={"day" + (d.dayKey === dayKey ? " sel" : "")} onClick={() => { setDayKey(d.dayKey); setSlot(null); }}>
                <small>{d.weekday}</small><b>{d.dayNum}</b><i>{d.month}</i>
              </button>
            ))}
          </div>
        )}
        <div className="slots">
          {!day && days.length > 0 && <p className="hint">Pick a day above.</p>}
          {day?.slots.map((s) => (
            <button key={s.starts_at} type="button" className={"slot" + (slot?.starts_at === s.starts_at ? " sel" : "")} onClick={() => setSlot(s)}>{s.label}</button>
          ))}
        </div>
        <p className="hint" style={{ marginTop: ".8rem" }}>Times shown in Eastern time. Booked times are hidden automatically.</p>
      </div>

      <div className="card">
        <h3>Your request</h3>
        <form className="stack" onSubmit={submit} noValidate>
          <div className="summary">{slot && day ? `${SESSION_LABEL[type]} · ${day.label} at ${slot.label} · ${format === "online" ? "Online" : "In-home"}` : day ? `Now pick a time on ${day.label}` : "Choose a day and time to begin."}</div>
          <div className="seg">
            <button type="button" className={format === "in_home" ? "on" : ""} onClick={() => setFormat("in_home")}>In-home</button>
            <button type="button" className={format === "online" ? "on" : ""} onClick={() => setFormat("online")}>Online</button>
          </div>
          <div className="two">
            <label>Parent name<input name="parent_name" id="parent_name" autoComplete="name" required /></label>
            <label>Email<input name="parent_email" id="parent_email" type="email" autoComplete="email" required /></label>
          </div>
          <div className="two">
            <label>Phone (optional)<input name="parent_phone" id="parent_phone" type="tel" autoComplete="tel" /></label>
            <label>Child&apos;s first name<input name="child_name" id="child_name" required /></label>
          </div>
          <label>Grade<select name="child_grade" id="child_grade" defaultValue="Grade 1">{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
          <label>Anything Lindsay should know?<textarea name="notes" id="notes" placeholder="Goals, what school has shared, what your child loves..." /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" type="submit" disabled={pending}>{pending ? "Sending..." : "Request this time"}</button>
          <p className="note">Nothing is charged online. You&apos;ll get an email copy right away and a confirmation from Lindsay the same day.</p>
        </form>
      </div>
    </div>
  );
}
