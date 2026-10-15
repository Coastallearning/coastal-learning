import { notFound } from "next/navigation";
import { parentContext, childRecord } from "@/lib/data";
import { Tabs, SkillBars, BriefingList, SessionList, WorkFolder } from "@/components/Record";
import { fmtDate, fmtTime } from "@/lib/slots";

export default async function ChildPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const { children } = await parentContext();
  if (!children.some((c) => c.id === id)) notFound();
  const { child, briefings, skills, files, bookings } = await childRecord(id);
  if (!child) notFound();
  const next = bookings[0];
  const base = `/portal/child/${id}`;
  return (
    <div className="card">
      <div className="toolbar-row">
        <div><span className="eyebrow">{child.grade}</span><h2 style={{ fontSize: "2rem" }}>{child.first_name}</h2></div>
      </div>
      <Tabs base={base} tab={tab} counts={{ briefs: briefings.length, work: files.length, sessions: bookings.length }} />
      {tab === "overview" && (
        <div>
          <div className="tile-row">
            <div className="tile"><small>Sessions so far</small><b>{briefings.length}</b></div>
            <div className="tile"><small>Current focus</small><b style={{ fontSize: "1.2rem" }}>{child.current_focus ?? "Getting started"}</b></div>
            <div className="tile"><small>Next session</small><b style={{ fontSize: "1.2rem" }}>{next ? `${fmtDate(new Date(next.starts_at))}, ${fmtTime(new Date(next.starts_at))}` : "Not scheduled"}</b></div>
          </div>
          <h3>Progress by skill</h3>
          <p className="hint" style={{ marginBottom: ".6rem" }}>Lindsay updates these after sessions, based on what she observes, not on test scores alone.</p>
          <SkillBars skills={skills} />
          <h3 style={{ marginTop: "1.4rem" }}>Practice at home this week</h3>
          <p>{child.home_practice ?? "Lindsay will add a simple at-home routine after your first session."}</p>
        </div>
      )}
      {tab === "briefs" && <BriefingList briefings={briefings} />}
      {tab === "work" && <WorkFolder files={files} childId={id} canDelete={false} />}
      {tab === "sessions" && <><SessionList bookings={bookings} /><p className="hint" style={{ marginTop: ".8rem" }}>Need to reschedule? Message Lindsay at least 24 hours ahead.</p></>}
    </div>
  );
}
