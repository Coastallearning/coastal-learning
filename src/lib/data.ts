import { createClient, currentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Child = { id: string; family_id: string; first_name: string; grade: string; school: string | null; current_focus: string | null; home_practice: string | null; notes_private: string | null };
export type Booking = { id: string; starts_at: string; ends_at: string; type: "consultation" | "session_45" | "session_60"; format: "in_home" | "online"; status: string; parent_name: string; parent_email: string; parent_phone: string | null; child_name: string; child_grade: string; notes: string | null; family_id: string | null; child_id: string | null; video_room: string | null };
export type Briefing = { id: string; child_id: string; session_date: string; focus: string; worked_on: string; wins: string | null; next_steps: string | null; home_practice: string | null; emailed_at: string | null };
export type Skill = { id: string; name: string; level: number; sort: number };
export type FileRow = { id: string; file_name: string; size_bytes: number | null; mime: string | null; created_at: string; uploaded_by: string | null; profiles?: { full_name: string; role: string } | null };
export type Message = { id: string; sender_id: string | null; body: string; created_at: string; profiles?: { full_name: string; role: string } | null };

/** The signed-in parent, their family and children. Redirects tutors to their desk. */
export async function parentContext() {
  const profile = await currentProfile();
  if (!profile) redirect("/login?next=/portal");
  if (profile.role === "tutor") redirect("/admin");
  const supabase = await createClient();
  const { data: fm } = await supabase.from("family_members").select("families(id, name)").eq("profile_id", profile.id).maybeSingle();
  const family = (fm as unknown as { families: { id: string; name: string } } | null)?.families ?? null;
  const { data: children } = family ? await supabase.from("children").select("*").eq("family_id", family.id).order("created_at") : { data: [] };
  return { profile, family, children: (children ?? []) as Child[], supabase };
}

export async function tutorContext() {
  const profile = await currentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "tutor") redirect("/portal");
  const supabase = await createClient();
  return { profile, supabase };
}

export async function childRecord(childId: string) {
  const supabase = await createClient();
  const [{ data: child }, { data: briefings }, { data: skills }, { data: files }, { data: bookings }] = await Promise.all([
    supabase.from("children").select("*").eq("id", childId).single(),
    supabase.from("briefings").select("*").eq("child_id", childId).order("session_date", { ascending: false }),
    supabase.from("skills").select("*").eq("child_id", childId).order("sort"),
    supabase.from("files").select("*, profiles(full_name, role)").eq("child_id", childId).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").eq("child_id", childId).in("status", ["pending", "confirmed"]).gte("ends_at", new Date().toISOString()).order("starts_at"),
  ]);
  return { child: child as Child | null, briefings: (briefings ?? []) as Briefing[], skills: (skills ?? []) as Skill[], files: (files ?? []) as FileRow[], bookings: (bookings ?? []) as Booking[] };
}

export function fmtBytes(n?: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
export function fileTag(name: string, mime?: string | null) {
  if (mime?.startsWith("image/")) return "IMG";
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
  return ext.slice(0, 4);
}
export function shortDate(s: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(s + (s.length === 10 ? "T12:00:00" : "")));
}
