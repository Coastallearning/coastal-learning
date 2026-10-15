import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/supabase/server";
import { updatePassword } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";
import Link from "next/link";

/** Landing page after an invite link: the parent chooses a password. */
export default async function Welcome() {
  const p = await currentProfile();
  if (!p) redirect("/login");
  return (
    <section>
      <div className="wrap">
        <div className="card auth">
          <span className="eyebrow">Welcome</span>
          <h2 style={{ marginBottom: ".4rem" }}>Hi {p.full_name || "there"}, choose a password</h2>
          <p className="hint" style={{ marginBottom: "1.2rem" }}>You&apos;re signed in for now. Set a password so you can come back any time.</p>
          <ActionForm action={updatePassword} success="Saved. You're all set." resetOnSuccess={false}>
            <label>New password<input name="password" id="password" type="password" autoComplete="new-password" minLength={8} required /></label>
            <button className="btn" type="submit">Save password</button>
          </ActionForm>
          <p style={{ marginTop: "1rem" }}><Link className="btn sea sm" href="/portal">Go to the parent portal</Link></p>
        </div>
      </div>
    </section>
  );
}
