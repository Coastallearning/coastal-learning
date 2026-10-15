"use client";
import { useState } from "react";
import ActionForm from "@/components/ActionForm";
import type { Skill } from "@/lib/data";

const SUGGESTED = ["Phonics & decoding", "Reading fluency", "Comprehension", "Writing", "Math facts", "Problem solving", "Organization", "Confidence"];

export default function SkillEditor({ childId, skills, action }: { childId: string; skills: Skill[]; action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }> }) {
  const [rows, setRows] = useState<{ name: string; level: number }[]>(skills.length ? skills.map((s) => ({ name: s.name, level: s.level })) : [{ name: "", level: 50 }]);
  const set = (i: number, patch: Partial<{ name: string; level: number }>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <ActionForm action={action} resetOnSuccess={false} success="Progress saved.">
      <input type="hidden" name="child_id" value={childId} />
      <p className="hint">Rate 0 to 100. Parents see these as bars. Ideas: {SUGGESTED.join(", ")}.</p>
      {rows.map((r, i) => (
        <div className="skill" key={i} style={{ gridTemplateColumns: "1fr 1fr 60px auto" }}>
          <input name="name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Skill" list="skill-ideas" />
          <input type="range" min={0} max={100} value={r.level} onChange={(e) => set(i, { level: +e.target.value })} aria-label="Level" style={{ padding: 0 }} />
          <input name="level" type="number" min={0} max={100} value={r.level} onChange={(e) => set(i, { level: +e.target.value })} />
          <button type="button" className="btn danger sm" onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <datalist id="skill-ideas">{SUGGESTED.map((s) => <option key={s} value={s} />)}</datalist>
      <div className="row">
        <button type="button" className="btn ghost sm" onClick={() => setRows([...rows, { name: "", level: 50 }])}>Add a skill</button>
        <button type="submit" className="btn sm">Save progress</button>
      </div>
    </ActionForm>
  );
}
