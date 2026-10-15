/** Availability engine: turns weekly rules + busy intervals into bookable slots, timezone-aware. */

export type Rule = { weekday: number; start_time: string; end_time: string; slot_minutes: number; active: boolean };
export type Busy = { starts_at: string; ends_at: string };
export type Slot = { starts_at: string; ends_at: string; label: string; dayKey: string };

export const TUTOR_TZ = process.env.TUTOR_TZ ?? process.env.NEXT_PUBLIC_TUTOR_TZ ?? "America/New_York";

export const SESSION_MINUTES: Record<string, number> = { consultation: 20, session_45: 45, session_60: 60 };
export const SESSION_LABEL: Record<string, string> = {
  consultation: "Free consultation (20 min)",
  session_45: "Tutoring session (45 min)",
  session_60: "Tutoring session (60 min)",
};
export const FORMAT_LABEL: Record<string, string> = { in_home: "In-home", online: "Online" };

/** Wall-clock parts of an instant in a timezone. */
export function partsIn(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short",
  });
  const p: Record<string, string> = {};
  for (const { type, value } of f.formatToParts(date)) p[type] = value;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    y: +p.year, m: +p.month, d: +p.day, hh: +p.hour, mm: +p.minute,
    weekday: weekdays.indexOf(p.weekday),
    dayKey: `${p.year}-${p.month}-${p.day}`,
  };
}

/** The UTC instant for a wall-clock time (y,m,d,hh,mm) in a timezone. */
export function zonedToUtc(y: number, m: number, d: number, hh: number, mm: number, tz: string): Date {
  // first guess as if UTC, then correct by the zone's offset at that instant (twice handles DST edges)
  let guess = Date.UTC(y, m - 1, d, hh, mm);
  for (let i = 0; i < 2; i++) {
    const p = partsIn(new Date(guess), tz);
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm);
    guess += Date.UTC(y, m - 1, d, hh, mm) - asUtc;
  }
  return new Date(guess);
}

export function fmtTime(date: Date, tz = TUTOR_TZ) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(date);
}
export function fmtDate(date: Date, tz = TUTOR_TZ) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(date);
}
export function fmtDateTime(date: Date, tz = TUTOR_TZ) {
  return `${fmtDate(date, tz)} at ${fmtTime(date, tz)}`;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Open slots from `from` for `days` days, for a session of `minutes` length.
 * Slots start on the rule's grid (slot_minutes) and must fit entirely inside the window and clear of busy times.
 * Slots that start within `leadHours` from now are hidden so Lindsay always has notice.
 */
export function openSlots(opts: {
  rules: Rule[]; busy: Busy[]; from?: Date; days?: number; minutes: number; tz?: string; leadHours?: number;
}): Slot[] {
  const { rules, busy, minutes } = opts;
  const tz = opts.tz ?? TUTOR_TZ;
  const from = opts.from ?? new Date();
  const days = opts.days ?? 21;
  const lead = (opts.leadHours ?? 18) * 3600_000;
  const earliest = from.getTime() + lead;
  const busyMs = busy.map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()] as const);
  const out: Slot[] = [];

  const start = partsIn(from, tz);
  for (let i = 0; i < days; i++) {
    const dayUtc = new Date(Date.UTC(start.y, start.m - 1, start.d + i, 12)); // noon UTC avoids DST ambiguity
    const dp = partsIn(dayUtc, tz);
    for (const r of rules) {
      if (!r.active || r.weekday !== dp.weekday) continue;
      const [sh, sm] = r.start_time.split(":").map(Number);
      const [eh, em] = r.end_time.split(":").map(Number);
      const windowStart = zonedToUtc(dp.y, dp.m, dp.d, sh, sm, tz).getTime();
      const windowEnd = zonedToUtc(dp.y, dp.m, dp.d, eh, em, tz).getTime();
      const step = r.slot_minutes * 60_000;
      for (let t = windowStart; t + minutes * 60_000 <= windowEnd; t += step) {
        const end = t + minutes * 60_000;
        if (t < earliest) continue;
        if (busyMs.some(([bs, be]) => overlaps(t, end, bs, be))) continue;
        out.push({ starts_at: new Date(t).toISOString(), ends_at: new Date(end).toISOString(), label: fmtTime(new Date(t), tz), dayKey: dp.dayKey });
      }
    }
  }
  out.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return out;
}

/** Group slots by day for the booking calendar. */
export function groupByDay(slots: Slot[], tz = TUTOR_TZ) {
  const map = new Map<string, { dayKey: string; label: string; weekday: string; dayNum: number; month: string; slots: Slot[] }>();
  for (const s of slots) {
    const d = new Date(s.starts_at);
    if (!map.has(s.dayKey)) {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).formatToParts(d);
      const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
      map.set(s.dayKey, { dayKey: s.dayKey, label: fmtDate(d, tz), weekday: get("weekday"), dayNum: +get("day"), month: get("month"), slots: [] });
    }
    map.get(s.dayKey)!.slots.push(s);
  }
  return Array.from(map.values());
}
