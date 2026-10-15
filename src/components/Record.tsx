import Link from "next/link";
import type { Briefing, Skill, Booking, FileRow } from "@/lib/data";
import { shortDate, fmtBytes, fileTag } from "@/lib/data";
import { fmtTime, SESSION_LABEL, FORMAT_LABEL } from "@/lib/slots";
import FileList from "@/components/FileList";
import FileUpload from "@/components/FileUpload";

export function Tabs({ base, tab, counts }: { base: string; tab: string; counts: Record<string, number> }) {
  const tabs: [string, string][] = [["overview", "Overview"], ["briefs", `Session briefings (${counts.briefs})`], ["work", `Work folder (${counts.work})`], ["sessions", `Upcoming sessions (${counts.sessions})`]];
  return (
    <div className="tabs">
      {tabs.map(([k, label]) => <Link key={k} href={`${base}?tab=${k}`} className={tab === k ? "on" : ""}>{label}</Link>)}
    </div>
  );
}

export function SkillBars({ skills }: { skills: Skill[] }) {
  if (!skills.length) return <p className="hint">Lindsay will add skill tracking after the first few sessions.</p>;
  return <div>{skills.map((s) => (
    <div className="skill" key={s.id}><span>{s.name}</span><span className="bar"><i style={{ width: `${s.level}%` }} /></span><span className="pct">{s.level}%</span></div>
  ))}</div>;
}

export function BriefingList({ briefings }: { briefings: Briefing[] }) {
  if (!briefings.length) return <p className="hint">No briefings yet. The first one arrives after your first session.</p>;
  return <div className="stack">{briefings.map((b) => (
    <article className="brief" key={b.id}>
      <div className="head"><b>{shortDate(b.session_date)}</b><span className="tag">{b.focus}</span></div>
      <dl>
        <dt>We worked on</dt><dd>{b.worked_on}</dd>
        {b.wins && <><dt>Wins</dt><dd>{b.wins}</dd></>}
        {b.next_steps && <><dt>Next steps</dt><dd>{b.next_steps}</dd></>}
        {b.home_practice && <><dt>Practice at home</dt><dd>{b.home_practice}</dd></>}
      </dl>
    </article>
  ))}</div>;
}

export function SessionList({ bookings, showRoomLink = true }: { bookings: Booking[]; showRoomLink?: boolean }) {
  if (!bookings.length) return <p className="hint">Nothing scheduled yet. <Link href="/book">Book a session</Link>.</p>;
  return <div className="list">{bookings.map((b) => {
    const d = new Date(b.starts_at);
    const [mon, day] = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }).format(d).split(" ");
    return (
      <div className="item sess" key={b.id}>
        <div className="d"><b>{day}</b><small>{mon}</small></div>
        <div style={{ minWidth: 0 }}><b>{SESSION_LABEL[b.type]}</b><small>{new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long" }).format(d)} {fmtTime(d)} · {b.status}</small></div>
        <div className="right">
          <span className={"chip " + (b.format === "online" ? "online" : "")}>{FORMAT_LABEL[b.format]}</span>
          {showRoomLink && b.format === "online" && b.video_room && b.status === "confirmed" && <Link className="btn sea sm" href={`/room/${b.video_room}`}>Join room</Link>}
        </div>
      </div>
    );
  })}</div>;
}

export function WorkFolder({ files, childId, canDelete }: { files: FileRow[]; childId: string; canDelete: boolean }) {
  return (
    <div>
      <p className="hint" style={{ marginBottom: ".8rem" }}>Worksheets, writing samples and photos from sessions. Parents can add files too, such as a report card or a teacher&apos;s note.</p>
      <FileList files={files.map((f) => ({ id: f.id, name: f.file_name, tag: fileTag(f.file_name, f.mime), size: fmtBytes(f.size_bytes), when: shortDate(f.created_at), by: f.profiles?.role === "tutor" ? "Lindsay" : f.profiles?.full_name || "Family" }))} canDelete={canDelete} />
      <FileUpload childId={childId} />
    </div>
  );
}
