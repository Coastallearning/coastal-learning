"use client";
import { useState, useTransition } from "react";

type Result = { ok: true } | { ok: false; error: string };

/** A form that calls a server action and shows its error or a success line without leaving the page. */
export default function ActionForm({ action, children, className = "stack", success, resetOnSuccess = true, onSuccess }: {
  action: (fd: FormData) => Promise<Result | void>;
  children: React.ReactNode; className?: string; success?: string; resetOnSuccess?: boolean; onSuccess?: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <form className={className} onSubmit={(e) => {
      e.preventDefault(); setErr(null); setOk(false);
      const form = e.currentTarget; const fd = new FormData(form);
      start(async () => {
        const r = await action(fd);
        if (r && !r.ok) setErr(r.error);
        else { setOk(true); if (resetOnSuccess) form.reset(); onSuccess?.(); }
      });
    }}>
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>{children}</fieldset>
      {err && <p className="err" role="alert">{err}</p>}
      {ok && success && <p className="ok">{success}</p>}
    </form>
  );
}
