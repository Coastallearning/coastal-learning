import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Coastal Learning <onboarding@resend.dev>";
const TUTOR = process.env.TUTOR_EMAIL ?? "lindsaykgagnon@gmail.com";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function client() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function wrap(title: string, body: string) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1f3764">
  <h1 style="font-weight:600;font-size:26px;margin:0 0 4px">Coastal Learning</h1>
  <p style="margin:0 0 20px;color:#7f9f8a;font-style:italic">with Lindsay Gagnon</p>
  <h2 style="font-size:20px;font-weight:600">${title}</h2>
  <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#2d3a4f">${body}</div>
  <p style="margin-top:28px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#5f6c80">Building confidence, inspiring learning. <a href="${SITE}" style="color:#3b6fb0">${SITE.replace(/^https?:\/\//, "")}</a></p>
</div>`;
}

async function send(to: string | string[], subject: string, html: string) {
  const r = client();
  if (!r) { console.warn("[email] RESEND_API_KEY not set; would send:", subject, "to", to); return; }
  try {
    const { data, error } = await r.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] rejected:", subject, "->", to, JSON.stringify(error));
    else console.log("[email] sent:", subject, "->", to, data?.id);
  } catch (e) { console.error("[email] failed", subject, e); }
}

export async function emailBookingRequested(b: { parent_name: string; parent_email: string; child_name: string; child_grade: string; when: string; type: string; format: string; notes?: string | null }) {
  await send(TUTOR, `New request: ${b.child_name} (${b.child_grade}) ${b.when}`, wrap("New booking request", `
    <p><b>${b.parent_name}</b> (${b.parent_email}) requested a <b>${b.type}</b>, <b>${b.format}</b>, for <b>${b.child_name}</b> (${b.child_grade}) on <b>${b.when}</b>.</p>
    ${b.notes ? `<p><i>“${b.notes}”</i></p>` : ""}
    <p><a href="${SITE}/admin/bookings" style="background:#1f3764;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Confirm or decline</a></p>`));
  await send(b.parent_email, `We received your request, ${b.parent_name}`, wrap("Thanks for reaching out", `
    <p>Your request for a <b>${b.type}</b> for ${b.child_name} on <b>${b.when}</b> (${b.format}) is on Lindsay's calendar, pending her confirmation. She confirms every request personally within one business day.</p>
    <p>Reply to this email any time with questions.</p>`));
}

export async function emailBookingConfirmed(b: { parent_name: string; parent_email: string; child_name: string; when: string; type: string; format: string; video_room?: string | null }) {
  const link = b.video_room ? `<p>Your session link: <a href="${SITE}/room/${b.video_room}">${SITE}/room/${b.video_room}</a><br>Open it a few minutes early on a laptop or tablet. The tutoring room has the video call and a shared whiteboard.</p>` : `<p>Lindsay will come to you. If anything changes, reply to this email.</p>`;
  await send(b.parent_email, `Confirmed: ${b.child_name} on ${b.when}`, wrap("You're confirmed", `
    <p>${b.type} for <b>${b.child_name}</b> on <b>${b.when}</b>, ${b.format.toLowerCase()}.</p>${link}
    <p>Sign in to the parent portal any time to see upcoming sessions and briefings: <a href="${SITE}/portal">${SITE}/portal</a></p>`));
}

export async function emailBookingDeclined(b: { parent_name: string; parent_email: string; child_name: string; when: string; message?: string }) {
  await send(b.parent_email, `About your request for ${b.when}`, wrap("That time didn't work", `
    <p>Lindsay can't take ${b.child_name} at ${b.when}. ${b.message ?? "Please pick another open time and she will confirm it right away."}</p>
    <p><a href="${SITE}/book" style="background:#1f3764;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">See open times</a></p>`));
}

export async function emailBriefing(to: string[], b: { child: string; date: string; focus: string; worked_on: string; wins?: string | null; next_steps?: string | null; home_practice?: string | null }) {
  const row = (k: string, v?: string | null) => v ? `<tr><td style="padding:6px 10px 6px 0;font-weight:bold;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0">${v}</td></tr>` : "";
  await send(to, `${b.child}'s session briefing, ${b.date}`, wrap(`${b.child}'s session briefing`, `
    <p>${b.date} · focus: <b>${b.focus}</b></p>
    <table style="border-collapse:collapse">${row("We worked on", b.worked_on)}${row("Wins", b.wins)}${row("Next steps", b.next_steps)}${row("Practice at home", b.home_practice)}</table>
    <p>Every briefing is saved in the parent portal: <a href="${SITE}/portal">${SITE}/portal</a></p>`));
}

export async function emailNewMessage(to: string[], from: string, body: string) {
  await send(to, `New message from ${from}`, wrap(`Message from ${from}`, `<p>${body}</p><p><a href="${SITE}/portal/messages">Reply in the portal</a></p>`));
}
