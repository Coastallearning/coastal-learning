import { redirect } from "next/navigation";
import Link from "next/link";
import { parentContext } from "@/lib/data";

export default async function PortalHome() {
  const { children, family, supabase, profile } = await parentContext();
  if (children[0]) redirect(`/portal/child/${children[0].id}`);
  // family exists but no child yet, or a prospect signed in before Lindsay set things up
  const { data: requests } = await supabase.from("bookings").select("*").eq("parent_email", profile.email).order("starts_at");
  return (
    <div className="card">
      <h3>Welcome{family ? ` to the ${family.name} portal` : ""}</h3>
      <p>Once Lindsay adds your child, you&apos;ll see session briefings, saved work and progress here.</p>
      {requests && requests.length > 0 && <p className="hint" style={{ marginTop: ".8rem" }}>You have {requests.length} booking request{requests.length > 1 ? "s" : ""} on file.</p>}
      <p style={{ marginTop: "1rem" }}><Link className="btn sm" href="/book">Schedule a free consultation</Link></p>
    </div>
  );
}
