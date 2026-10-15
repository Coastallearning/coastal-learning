"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/actions";

export default function FileUpload({ childId }: { childId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form style={{ marginTop: ".9rem" }} onSubmit={(e) => { e.preventDefault(); setErr(null); const fd = new FormData(e.currentTarget); start(async () => { const r = await uploadFile(fd); if (!r.ok) setErr(r.error); else router.refresh(); }); }}>
      <input type="hidden" name="child_id" value={childId} />
      <div className="row">
        <input type="file" name="file" id={`file-${childId}`} required style={{ maxWidth: 320 }} />
        <button className="btn ghost sm" type="submit" disabled={pending}>{pending ? "Uploading..." : "Add file"}</button>
      </div>
      {err && <p className="err">{err}</p>}
    </form>
  );
}
