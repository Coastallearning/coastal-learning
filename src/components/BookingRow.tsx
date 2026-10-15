import Link from "next/link";
import type { Booking } from "@/lib/data";
import { fmtDateTime, SESSION_LABEL, FORMAT_LABEL } from "@/lib/slots";
import { decideBooking, linkBookingToChild } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

type ChildOpt = { id: string; first_name: string; family: string };

export default function BookingRow({ b, childOptions }: { b: Booking; childOptions: ChildOpt[] }) {
  return (
    <div className="item" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>
        <b>{b.child_name} ({b.child_grade}) · {fmtDateTime(new Date(b.starts_at))}</b>
        <small>{SESSION_LABEL[b.type]} · {FORMAT_LABEL[b.format]} · {b.parent_name}, <a href={`mailto:${b.parent_email}`}>{b.parent_email}</a>{b.parent_phone ? ` · ${b.parent_phone}` : ""}</small>
        {b.notes && <p className="hint" style={{ marginTop: ".3rem" }}>&ldquo;{b.notes}&rdquo;</p>}
        {!b.child_id && childOptions.length > 0 && (
          <ActionForm action={linkBookingToChild} className="row" success="Linked.">
            <input type="hidden" name="id" value={b.id} />
            <select name="child_id" style={{ maxWidth: 260 }} defaultValue="">
              <option value="" disabled>Link to a student...</option>
              {childOptions.map((c) => <option key={c.id} value={c.id}>{c.first_name} ({c.family})</option>)}
            </select>
            <button className="btn ghost sm" type="submit">Link</button>
          </ActionForm>
        )}
      </div>
      <div className="right">
        <span className={"chip " + b.status}>{b.status}</span>
        {b.format === "online" && b.video_room && <Link className="btn ghost sm" href={`/room/${b.video_room}`}>Room</Link>}
        {b.status === "pending" && <>
          <ActionForm action={decideBooking} className="row"><input type="hidden" name="id" value={b.id} /><input type="hidden" name="decision" value="confirm" /><button className="btn sm" type="submit">Confirm</button></ActionForm>
          <ActionForm action={decideBooking} className="row"><input type="hidden" name="id" value={b.id} /><input type="hidden" name="decision" value="decline" /><button className="btn danger sm" type="submit">Decline</button></ActionForm>
        </>}
        {b.status === "confirmed" && <>
          <ActionForm action={decideBooking} className="row"><input type="hidden" name="id" value={b.id} /><input type="hidden" name="decision" value="complete" /><button className="btn ghost sm" type="submit">Mark done</button></ActionForm>
          <ActionForm action={decideBooking} className="row"><input type="hidden" name="id" value={b.id} /><input type="hidden" name="decision" value="cancel" /><button className="btn danger sm" type="submit">Cancel</button></ActionForm>
        </>}
      </div>
    </div>
  );
}
