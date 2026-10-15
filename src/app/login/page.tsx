import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/supabase/server";
import { signIn, sendMagicLink } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const p = await currentProfile();
  const sp = await searchParams;
  if (p) redirect(p.role === "tutor" ? "/admin" : "/portal");
  return (
    <section>
      <div className="wrap">
        <div className="card auth">
          <span className="eyebrow">Parent portal</span>
          <h2 style={{ marginBottom: ".4rem" }}>Family sign in</h2>
          <p className="hint" style={{ marginBottom: "1.2rem" }}>Session briefings, saved work, progress by skill, upcoming sessions and messages with Lindsay.</p>
          {sp.error === "link" && <p className="err">That sign-in link expired. Request a new one below.</p>}
          <ActionForm action={signIn} resetOnSuccess={false}>
            <input type="hidden" name="next" value={sp.next ?? ""} />
            <label>Email<input name="email" id="email" type="email" autoComplete="username" required /></label>
            <label>Password<input name="password" id="password" type="password" autoComplete="current-password" required /></label>
            <button className="btn" type="submit">Sign in</button>
          </ActionForm>
          <details style={{ marginTop: "1rem", border: 0 }}>
            <summary style={{ fontSize: "1rem", fontFamily: "var(--sans)", fontWeight: 600 }}>Forgot your password, or prefer a sign-in link?</summary>
            <ActionForm action={sendMagicLink} success="Check your email for a sign-in link." className="stack" >
              <label style={{ marginTop: ".6rem" }}>Email<input name="email" id="magic_email" type="email" required /></label>
              <button className="btn ghost sm" type="submit">Email me a link</button>
            </ActionForm>
          </details>
          <p className="hint" style={{ marginTop: "1.2rem" }}>Lindsay creates your family account after your free consultation. Questions? Lindsaykgagnon@gmail.com</p>
        </div>
      </div>
    </section>
  );
}
