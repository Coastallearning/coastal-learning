"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient, currentProfile } from "@/lib/supabase/server";
import { openSlots, SESSION_MINUTES, SESSION_LABEL, FORMAT_LABEL, fmtDateTime, type Rule, type Busy } from "@/lib/slots";
import { emailBookingRequested, emailBookingConfirmed, emailBookingDeclined, emailBriefing, emailNewMessage } from "@/lib/email";

type Result = { ok: true } | { ok: false; error: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function requireTutor() {
  const p = await currentProfile();
  if (!p || p.role !== "tutor") throw new Error("Not allowed");
  return p;
}

/* ---------------- public booking ---------------- */
/** Catches the common mistyped email domains (gmail.con, gmial.com, yahoo.co ...) before a confirmation bounces. */
const DOMAIN_FIXES: Record<string, string> = {
  "gmail.con": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.om": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.comm": "gmail.com",
  "yahoo.con": "yahoo.com", "yahoo.co": "yahoo.com", "yaho.com": "yahoo.com", "hotmail.con": "hotmail.com", "hotmail.co": "hotmail.com", "hotmial.com": "hotmail.com",
  "outlook.con": "outlook.com", "icloud.con": "icloud.com", "icloud.co": "icloud.com", "aol.con": "aol.com", "comcast.net.": "comcast.net", "comcast.ne": "comcast.net",
};
function emailTypo(email: string): string | null {
  const domain = email.split("@")[1] ?? "";
  const fix = DOMAIN_FIXES[domain];
  return fix ? email.replace(/@.*$/, "@" + fix) : null;
}

export async function requestBooking(form: FormData): Promise<Result> {
  const supabase = await createClient();
  const starts_at = str(form, "starts_at");
  const type = str(form, "type") as keyof typeof SESSION_MINUTES;
  const format = str(form, "format");
  const parent_name = str(form, "parent_name"), parent_email = str(form, "parent_email").toLowerCase();
  const parent_phone = str(form, "parent_phone"), child_name = str(form, "child_name"), child_grade = str(form, "child_grade"), notes = str(form, "notes");
  if (!SESSION_MINUTES[type] || !["in_home", "online"].includes(format)) return { ok: false, error: "Pick a session type and format." };
  if (!parent_name || !child_name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parent_email)) return { ok: false, error: "Please add your name, a valid email and your child's first name." };
  const suggestion = emailTypo(parent_email);
  if (suggestion) return { ok: false, error: `Please check your email address. Did you mean ${suggestion}? Lindsay's confirmation goes to this address.` };

  // Re-check the slot server side against live rules and busy times so two families can't take the same hour.
  const [{ data: rules }, { data: busy }] = await Promise.all([
    supabase.from("availability_rules").select("*").eq("active", true),
    supabase.from("public_busy").select("*"),
  ]);
  const slots = openSlots({ rules: (rules ?? []) as Rule[], busy: (busy ?? []) as Busy[], minutes: SESSION_MINUTES[type] });
  const slot = slots.find((s) => s.starts_at === starts_at);
  if (!slot) return { ok: false, error: "That time was just taken. Please choose another open time." };

  // If this parent already has an account, link the booking to their family.
  const admin = createAdminClient();
  const { data: prof } = await admin.from("profiles").select("id").eq("email", parent_email).maybeSingle();
  let family_id: string | null = null;
  if (prof) {
    const { data: fm } = await admin.from("family_members").select("family_id").eq("profile_id", prof.id).maybeSingle();
    family_id = fm?.family_id ?? null;
  }
  const video_room = format === "online" ? `cl-${crypto.randomUUID().slice(0, 8)}` : null;
  const { error } = await supabase.from("bookings").insert({
    starts_at: slot.starts_at, ends_at: slot.ends_at, type, format, parent_name, parent_email, parent_phone: parent_phone || null,
    child_name, child_grade, notes: notes || null, family_id, video_room,
  });
  if (error) return { ok: false, error: "Something went wrong saving your request. Please try again." };
  await emailBookingRequested({ parent_name, parent_email, child_name, child_grade, when: fmtDateTime(new Date(slot.starts_at)), type: SESSION_LABEL[type], format: FORMAT_LABEL[format], notes });
  revalidatePath("/book");
  return { ok: true };
}

/* ---------------- auth ---------------- */
export async function signIn(form: FormData): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(form, "email").toLowerCase(), password: str(form, "password") });
  if (error) return { ok: false, error: "That email and password don't match. Family accounts are created by Lindsay after your consultation." };
  const p = await currentProfile();
  redirect(str(form, "next") || (p?.role === "tutor" ? "/admin" : "/portal"));
}

export async function sendMagicLink(form: FormData): Promise<Result> {
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({ email: str(form, "email").toLowerCase(), options: { shouldCreateUser: false, emailRedirectTo: `${site}/portal` } });
  if (error) return { ok: false, error: "We couldn't find an account for that email." };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updatePassword(form: FormData): Promise<Result> {
  const supabase = await createClient();
  const pw = str(form, "password");
  if (pw.length < 8) return { ok: false, error: "Use at least 8 characters." };
  const { error } = await supabase.auth.updateUser({ password: pw });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ---------------- admin: bookings ---------------- */
export async function decideBooking(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const id = str(form, "id"), decision = str(form, "decision"), message = str(form, "message");
  const { data: b } = await supabase.from("bookings").select("*").eq("id", id).single();
  if (!b) return { ok: false, error: "Booking not found." };
  const status = decision === "confirm" ? "confirmed" : decision === "decline" ? "declined" : decision === "complete" ? "completed" : "cancelled";
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  const when = fmtDateTime(new Date(b.starts_at));
  let sent: boolean | null = null;
  if (status === "confirmed") sent = await emailBookingConfirmed({ parent_name: b.parent_name, parent_email: b.parent_email, child_name: b.child_name, when, type: SESSION_LABEL[b.type], format: FORMAT_LABEL[b.format], video_room: b.video_room });
  if (status === "declined") sent = await emailBookingDeclined({ parent_name: b.parent_name, parent_email: b.parent_email, child_name: b.child_name, when, message: message || undefined });
  revalidatePath("/admin"); revalidatePath("/admin/bookings"); revalidatePath("/portal");
  if (sent === false) return { ok: false, error: `Saved as ${status}, but the email to ${b.parent_email} could not be sent. Please contact ${b.parent_name} directly.` };
  return { ok: true };
}

export async function linkBookingToChild(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const child_id = str(form, "child_id");
  const { data: child } = await supabase.from("children").select("family_id").eq("id", child_id).single();
  if (!child) return { ok: false, error: "Child not found." };
  const { error } = await supabase.from("bookings").update({ child_id, family_id: child.family_id }).eq("id", str(form, "id"));
  revalidatePath("/admin/bookings");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ---------------- admin: availability ---------------- */
export async function saveRule(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const id = str(form, "id");
  const row = { weekday: +str(form, "weekday"), start_time: str(form, "start_time"), end_time: str(form, "end_time"), slot_minutes: +str(form, "slot_minutes") || 60, active: form.get("active") === "on" };
  if (row.start_time >= row.end_time) return { ok: false, error: "End time must be after start time." };
  const q = id ? supabase.from("availability_rules").update(row).eq("id", id) : supabase.from("availability_rules").insert(row);
  const { error } = await q;
  revalidatePath("/admin/availability"); revalidatePath("/book");
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteRule(form: FormData) {
  await requireTutor();
  const supabase = await createClient();
  await supabase.from("availability_rules").delete().eq("id", str(form, "id"));
  revalidatePath("/admin/availability"); revalidatePath("/book");
}

export async function addBlock(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const starts_at = str(form, "starts_at"), ends_at = str(form, "ends_at");
  if (!starts_at || !ends_at || starts_at >= ends_at) return { ok: false, error: "Pick a start and an end." };
  const { error } = await supabase.from("blocked_times").insert({ starts_at: new Date(starts_at).toISOString(), ends_at: new Date(ends_at).toISOString(), reason: str(form, "reason") || null });
  revalidatePath("/admin/availability"); revalidatePath("/book");
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteBlock(form: FormData) {
  await requireTutor();
  const supabase = await createClient();
  await supabase.from("blocked_times").delete().eq("id", str(form, "id"));
  revalidatePath("/admin/availability"); revalidatePath("/book");
}

/* ---------------- admin: families ---------------- */
/** Creates the family, invites the parent by email (Supabase sends the invite), adds the first child. */
export async function createFamily(form: FormData): Promise<Result> {
  await requireTutor();
  const admin = createAdminClient();
  const family_name = str(form, "family_name"), parent_name = str(form, "parent_name"), parent_email = str(form, "parent_email").toLowerCase();
  const child_name = str(form, "child_name"), child_grade = str(form, "child_grade");
  if (!family_name || !parent_name || !parent_email || !child_name) return { ok: false, error: "Family name, parent name, parent email and a child are required." };

  const { data: fam, error: fe } = await admin.from("families").insert({ name: family_name }).select().single();
  if (fe) return { ok: false, error: fe.message };

  let parentId: string | null = null;
  const { data: existing } = await admin.from("profiles").select("id").eq("email", parent_email).maybeSingle();
  if (existing) parentId = existing.id;
  else {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data: inv, error: ie } = await admin.auth.admin.inviteUserByEmail(parent_email, { data: { full_name: parent_name }, redirectTo: `${site}/welcome` });
    if (ie) return { ok: false, error: `Family created but the invite failed: ${ie.message}` };
    parentId = inv.user.id;
    await admin.from("profiles").update({ full_name: parent_name, email: parent_email }).eq("id", parentId);
  }
  await admin.from("family_members").insert({ family_id: fam.id, profile_id: parentId });
  const { data: child } = await admin.from("children").insert({ family_id: fam.id, first_name: child_name, grade: child_grade || "Pre-K" }).select().single();
  // link any earlier booking requests from this email
  await admin.from("bookings").update({ family_id: fam.id, child_id: child?.id ?? null }).eq("parent_email", parent_email).is("family_id", null);
  revalidatePath("/admin/families");
  return { ok: true };
}

export async function addChild(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const { error } = await supabase.from("children").insert({ family_id: str(form, "family_id"), first_name: str(form, "first_name"), grade: str(form, "grade") || "Pre-K" });
  revalidatePath("/admin/families");
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function updateChild(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const id = str(form, "id");
  const { error } = await supabase.from("children").update({ first_name: str(form, "first_name"), grade: str(form, "grade"), school: str(form, "school") || null, current_focus: str(form, "current_focus") || null, home_practice: str(form, "home_practice") || null, notes_private: str(form, "notes_private") || null }).eq("id", id);
  revalidatePath(`/admin/students/${id}`); revalidatePath("/portal");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ---------------- admin: learning record ---------------- */
export async function saveBriefing(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const admin = createAdminClient();
  const child_id = str(form, "child_id");
  const row = { child_id, session_date: str(form, "session_date") || new Date().toISOString().slice(0, 10), focus: str(form, "focus"), worked_on: str(form, "worked_on"), wins: str(form, "wins") || null, next_steps: str(form, "next_steps") || null, home_practice: str(form, "home_practice") || null, booking_id: str(form, "booking_id") || null };
  if (!row.focus || !row.worked_on) return { ok: false, error: "Focus and what you worked on are required." };
  const { data: saved, error } = await supabase.from("briefings").insert(row).select().single();
  if (error) return { ok: false, error: error.message };
  // keep the child's "current focus" and "practice at home" in step with the latest briefing
  await supabase.from("children").update({ current_focus: row.focus, home_practice: row.home_practice }).eq("id", child_id);
  if (form.get("email_parents") === "on") {
    const { data: child } = await admin.from("children").select("first_name, family_id").eq("id", child_id).single();
    const { data: members } = await admin.from("family_members").select("profiles(email)").eq("family_id", child!.family_id);
    const to = (members ?? []).map((m) => (m as unknown as { profiles: { email: string } }).profiles?.email).filter(Boolean) as string[];
    if (to.length) {
      await emailBriefing(to, { child: child!.first_name, date: row.session_date, ...row });
      await supabase.from("briefings").update({ emailed_at: new Date().toISOString() }).eq("id", saved.id);
    }
  }
  if (row.booking_id) await supabase.from("bookings").update({ status: "completed" }).eq("id", row.booking_id);
  revalidatePath(`/admin/students/${child_id}`); revalidatePath("/portal");
  return { ok: true };
}

export async function saveSkills(form: FormData): Promise<Result> {
  await requireTutor();
  const supabase = await createClient();
  const child_id = str(form, "child_id");
  const names = form.getAll("name").map(String), levels = form.getAll("level").map(Number);
  const rows = names.map((name, i) => ({ child_id, name: name.trim(), level: Math.max(0, Math.min(100, levels[i] || 0)), sort: i, updated_at: new Date().toISOString() })).filter((r) => r.name);
  await supabase.from("skills").delete().eq("child_id", child_id);
  if (rows.length) {
    const { error } = await supabase.from("skills").insert(rows);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/students/${child_id}`); revalidatePath("/portal");
  return { ok: true };
}

/* ---------------- files (tutor or family) ---------------- */
export async function uploadFile(form: FormData): Promise<Result> {
  const p = await currentProfile();
  if (!p) return { ok: false, error: "Sign in first." };
  const supabase = await createClient();
  const child_id = str(form, "child_id");
  const file = form.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Choose a file." };
  if (file.size > 25 * 1024 * 1024) return { ok: false, error: "Files up to 25 MB, please." };
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${child_id}/${crypto.randomUUID()}-${safe}`;
  const { error: se } = await supabase.storage.from("student-files").upload(path, file, { contentType: file.type || undefined });
  if (se) return { ok: false, error: se.message };
  const { error } = await supabase.from("files").insert({ child_id, uploaded_by: p.id, storage_path: path, file_name: file.name, size_bytes: file.size, mime: file.type || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/portal/child/${child_id}`); revalidatePath(`/admin/students/${child_id}`);
  return { ok: true };
}

export async function deleteFile(form: FormData) {
  await requireTutor();
  const supabase = await createClient();
  const id = str(form, "id");
  const { data: f } = await supabase.from("files").select("storage_path, child_id").eq("id", id).single();
  if (f) {
    await supabase.storage.from("student-files").remove([f.storage_path]);
    await supabase.from("files").delete().eq("id", id);
    revalidatePath(`/admin/students/${f.child_id}`); revalidatePath(`/portal/child/${f.child_id}`);
  }
}

/** Short-lived download link; RLS on storage decides who may fetch it. */
export async function fileUrl(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: f } = await supabase.from("files").select("storage_path").eq("id", id).single();
  if (!f) return null;
  const { data } = await supabase.storage.from("student-files").createSignedUrl(f.storage_path, 60 * 10);
  return data?.signedUrl ?? null;
}

/* ---------------- messages ---------------- */
export async function sendMessage(form: FormData): Promise<Result> {
  const p = await currentProfile();
  if (!p) return { ok: false, error: "Sign in first." };
  const supabase = await createClient();
  const admin = createAdminClient();
  const family_id = str(form, "family_id"), body = str(form, "body");
  if (!body) return { ok: false, error: "Write something first." };
  const { error } = await supabase.from("messages").insert({ family_id, sender_id: p.id, body });
  if (error) return { ok: false, error: error.message };
  // notify the other side
  if (p.role === "tutor") {
    const { data: members } = await admin.from("family_members").select("profiles(email)").eq("family_id", family_id);
    const to = (members ?? []).map((m) => (m as unknown as { profiles: { email: string } }).profiles?.email).filter(Boolean) as string[];
    if (to.length) await emailNewMessage(to, "Lindsay", body);
  } else {
    await emailNewMessage([process.env.TUTOR_EMAIL ?? "lindsaykgagnon@gmail.com"], p.full_name || p.email, body);
  }
  revalidatePath("/portal/messages"); revalidatePath(`/admin/messages/${family_id}`);
  return { ok: true };
}
