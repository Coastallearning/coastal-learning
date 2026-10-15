import Link from "next/link";
import { tutorContext } from "@/lib/data";
import { createFamily, addChild } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

const GRADES = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

export default async function Families() {
  const { supabase } = await tutorContext();
  const { data: families } = await supabase.from("families").select("id, name, family_members(profiles(full_name, email)), children(id, first_name, grade)").order("name");
  type Fam = { id: string; name: string; family_members: { profiles: { full_name: string; email: string } | null }[]; children: { id: string; first_name: string; grade: string }[] };
  return (
    <div className="stack">
      <div className="card">
        <h3>Families &amp; students</h3>
        {!families?.length && <p className="hint">No families yet. Add the first one below; the parent gets an email invitation to the portal.</p>}
        <div className="list">
          {(families as Fam[] | null)?.map((f) => (
            <div className="item" key={f.id} style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                <b>{f.name}</b>
                <small>{f.family_members.map((m) => m.profiles ? `${m.profiles.full_name} · ${m.profiles.email}` : "").filter(Boolean).join(" · ")}</small>
                <div className="row" style={{ marginTop: ".5rem" }}>
                  {f.children.map((c) => <Link key={c.id} className="btn sea sm" href={`/admin/students/${c.id}`}>{c.first_name} <span className="hint" style={{ color: "inherit", opacity: .75 }}>({c.grade})</span></Link>)}
                </div>
              </div>
              <ActionForm action={addChild} className="row" success="Added.">
                <input type="hidden" name="family_id" value={f.id} />
                <input name="first_name" placeholder="Add a child" required style={{ maxWidth: 150 }} />
                <select name="grade" style={{ maxWidth: 140 }} defaultValue="Grade 1">{GRADES.map((g) => <option key={g}>{g}</option>)}</select>
                <button className="btn ghost sm" type="submit">Add</button>
              </ActionForm>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Add a family</h3>
        <p className="hint" style={{ marginBottom: "1rem" }}>Do this after the consultation. The parent receives an invitation email to set a password, and any booking requests from that email are linked automatically.</p>
        <ActionForm action={createFamily} success="Family created and invitation sent.">
          <div className="two">
            <label>Family name<input name="family_name" placeholder="The Harper family" required /></label>
            <label>Parent name<input name="parent_name" required /></label>
          </div>
          <div className="three">
            <label>Parent email<input name="parent_email" type="email" required /></label>
            <label>Child&apos;s first name<input name="child_name" required /></label>
            <label>Grade<select name="child_grade" defaultValue="Grade 1">{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
          </div>
          <button className="btn" type="submit" style={{ justifySelf: "start" }}>Create family and send invite</button>
        </ActionForm>
      </div>
    </div>
  );
}
