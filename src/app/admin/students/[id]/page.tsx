import Link from "next/link";
import { notFound } from "next/navigation";
import { tutorContext, childRecord } from "@/lib/data";
import { saveBriefing, saveSkills, updateChild } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";
import SkillEditor from "@/components/SkillEditor";
import { Tabs, BriefingList, SessionList, WorkFolder } from "@/components/Record";
import { fmtDateTime, SESSION_LABEL } from "@/lib/slots";

const GRADES = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

export default async function Student({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const { supabase } = await tutorContext();
  const { child, briefings, skills, files, bookings } = await childRecord(id);
  if (!child) notFound();
  const { data: recent } = await supabase.from("bookings").select("id, starts_at, type").eq("child_id", id).in("status", ["confirmed", "completed"]).lte("starts_at", new Date(Date.now() + 86400_000).toISOString()).order("starts_at", { ascending: false }).limit(6);
  const base = `/admin/students/${id}`;
  return (
    <div className="card">
      <div className="toolbar-row">
        <div><span className="eyebrow">{child.grade}{child.school ? ` · ${child.school}` : ""}</span><h2 style={{ fontSize: "2rem" }}>{child.first_name}</h2></div>
        <Link className="hint" href={`/admin/messages/${child.family_id}`}>Message the family</Link>
      </div>
      <Tabs base={base} tab={tab} counts={{ briefs: briefings.length, work: files.length, sessions: bookings.length }} />

      {tab === "overview" && (
        <div className="stack" style={{ gap: "1.6rem" }}>
          <div>
            <h3>Write a session briefing</h3>
            <p className="hint" style={{ marginBottom: ".8rem" }}>Saved to the portal, and emailed to the parents if the box is checked. The focus and at-home practice also update {child.first_name}&apos;s overview.</p>
            <ActionForm action={saveBriefing} success="Briefing saved.">
              <input type="hidden" name="child_id" value={id} />
              <div className="three">
                <label>Session date<input type="date" name="session_date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
                <label>Focus<input name="focus" placeholder="Reading fluency" required /></label>
                <label>Linked session<select name="booking_id" defaultValue=""><option value="">None</option>{recent?.map((b) => <option key={b.id} value={b.id}>{fmtDateTime(new Date(b.starts_at))} · {SESSION_LABEL[b.type as keyof typeof SESSION_LABEL]}</option>)}</select></label>
              </div>
              <label>We worked on<textarea name="worked_on" required /></label>
              <div className="two">
                <label>Wins<textarea name="wins" /></label>
                <label>Next steps<textarea name="next_steps" /></label>
              </div>
              <label>Practice at home<textarea name="home_practice" /></label>
              <label className="row" style={{ gap: ".4rem", fontWeight: 600 }}><input type="checkbox" name="email_parents" defaultChecked style={{ width: "auto" }} /> Email this briefing to the parents</label>
              <button className="btn" type="submit" style={{ justifySelf: "start" }}>Save briefing</button>
            </ActionForm>
          </div>
          <div>
            <h3>Progress by skill</h3>
            <SkillEditor childId={id} skills={skills} action={saveSkills} />
          </div>
          <div>
            <h3>Student details</h3>
            <ActionForm action={updateChild} resetOnSuccess={false} success="Saved.">
              <input type="hidden" name="id" value={id} />
              <div className="three">
                <label>First name<input name="first_name" defaultValue={child.first_name} required /></label>
                <label>Grade<select name="grade" defaultValue={child.grade}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
                <label>School<input name="school" defaultValue={child.school ?? ""} /></label>
              </div>
              <div className="two">
                <label>Current focus (shown to parents)<input name="current_focus" defaultValue={child.current_focus ?? ""} /></label>
                <label>Practice at home (shown to parents)<input name="home_practice" defaultValue={child.home_practice ?? ""} /></label>
              </div>
              <label>Private notes (only you)<textarea name="notes_private" defaultValue={child.notes_private ?? ""} /></label>
              <button className="btn ghost sm" type="submit" style={{ justifySelf: "start" }}>Save details</button>
            </ActionForm>
          </div>
        </div>
      )}
      {tab === "briefs" && <BriefingList briefings={briefings} />}
      {tab === "work" && <WorkFolder files={files} childId={id} canDelete />}
      {tab === "sessions" && <SessionList bookings={bookings} />}
    </div>
  );
}
