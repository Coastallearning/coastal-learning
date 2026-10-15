"use client";
import { useState } from "react";
import { fileUrl, deleteFile } from "@/lib/actions";

type F = { id: string; name: string; tag: string; size: string; when: string; by: string };

export default function FileList({ files, canDelete }: { files: F[]; canDelete: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  if (!files.length) return <p className="hint">No files yet.</p>;
  async function open(id: string) {
    setBusy(id);
    const url = await fileUrl(id);
    setBusy(null);
    if (url) window.open(url, "_blank", "noopener");
  }
  return (
    <div className="list">
      {files.map((f) => (
        <div className="item" key={f.id}>
          <span className="ft">{f.tag}</span>
          <span style={{ minWidth: 0 }}><b>{f.name}</b><small>{f.when}{f.size ? ` · ${f.size}` : ""} · added by {f.by}</small></span>
          <span className="right">
            <button className="btn ghost sm" type="button" onClick={() => open(f.id)} disabled={busy === f.id}>{busy === f.id ? "Opening..." : "Open"}</button>
            {canDelete && <form action={deleteFile}><input type="hidden" name="id" value={f.id} /><button className="btn danger sm" type="submit">Delete</button></form>}
          </span>
        </div>
      ))}
    </div>
  );
}
