import { tutorContext } from "@/lib/data";
import { saveRule, deleteRule, addBlock, deleteBlock } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";
import { fmtDateTime } from "@/lib/slots";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function Availability() {
  const { supabase } = await tutorContext();
  const [{ data: rules }, { data: blocks }] = await Promise.all([
    supabase.from("availability_rules").select("*").order("weekday").order("start_time"),
    supabase.from("blocked_times").select("*").gte("ends_at", new Date().toISOString()).order("starts_at"),
  ]);
  return (
    <div className="stack">
      <div className="card">
        <h3>Weekly hours</h3>
        <p className="hint" style={{ marginBottom: "1rem" }}>Families can book inside these windows. Slots start every &ldquo;grid&rdquo; minutes (60 means on the hour). Turn a window off to hide it without deleting it.</p>
        <div className="list">
          {rules?.map((r) => (
            <div className="item" key={r.id} style={{ flexWrap: "wrap" }}>
            <ActionForm action={saveRule} className="row" resetOnSuccess={false} success="Saved.">
              <input type="hidden" name="id" value={r.id} />
              <select name="weekday" defaultValue={r.weekday} style={{ maxWidth: 130 }}>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select>
              <input type="time" name="start_time" defaultValue={r.start_time.slice(0, 5)} style={{ maxWidth: 120 }} />
              <span className="hint">to</span>
              <input type="time" name="end_time" defaultValue={r.end_time.slice(0, 5)} style={{ maxWidth: 120 }} />
              <label className="row hint" style={{ gap: ".3rem" }}>grid <input type="number" name="slot_minutes" defaultValue={r.slot_minutes} min={15} step={15} style={{ width: 70 }} /></label>
              <label className="row hint" style={{ gap: ".3rem" }}><input type="checkbox" name="active" defaultChecked={r.active} style={{ width: "auto" }} /> on</label>
              <button className="btn ghost sm" type="submit">Save</button>
            </ActionForm>
            <form action={deleteRule} className="right"><input type="hidden" name="id" value={r.id} /><button className="btn danger sm" type="submit">Remove</button></form>
            </div>
          ))}
        </div>
        <h4 style={{ margin: "1.2rem 0 .5rem" }}>Add a window</h4>
        <ActionForm action={saveRule} className="item" success="Added.">
          <select name="weekday" defaultValue={1} style={{ maxWidth: 130 }}>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select>
          <input type="time" name="start_time" defaultValue="15:00" style={{ maxWidth: 120 }} />
          <span className="hint">to</span>
          <input type="time" name="end_time" defaultValue="18:00" style={{ maxWidth: 120 }} />
          <label className="row hint" style={{ gap: ".3rem" }}>grid <input type="number" name="slot_minutes" defaultValue={60} min={15} step={15} style={{ width: 70 }} /></label>
          <input type="hidden" name="active" value="on" />
          <span className="right"><button className="btn sm" type="submit">Add</button></span>
        </ActionForm>
      </div>

      <div className="card">
        <h3>Time off</h3>
        <p className="hint" style={{ marginBottom: "1rem" }}>Vacations, appointments, holidays. Anything here is hidden from the booking page.</p>
        <div className="list">
          {blocks?.map((b) => (
            <div className="item" key={b.id}>
              <span style={{ minWidth: 0 }}><b>{fmtDateTime(new Date(b.starts_at))} to {fmtDateTime(new Date(b.ends_at))}</b><small>{b.reason ?? ""}</small></span>
              <form action={deleteBlock} className="right"><input type="hidden" name="id" value={b.id} /><button className="btn danger sm" type="submit">Remove</button></form>
            </div>
          ))}
          {!blocks?.length && <p className="hint">No time off scheduled.</p>}
        </div>
        <ActionForm action={addBlock} className="item" success="Blocked.">
          <input type="datetime-local" name="starts_at" required style={{ maxWidth: 220 }} />
          <span className="hint">to</span>
          <input type="datetime-local" name="ends_at" required style={{ maxWidth: 220 }} />
          <input name="reason" placeholder="Reason (optional)" style={{ maxWidth: 220 }} />
          <span className="right"><button className="btn sm" type="submit">Block</button></span>
        </ActionForm>
      </div>
    </div>
  );
}
