import { tutorContext } from "@/lib/data";
import { signOut } from "@/lib/actions";
import SideNav from "@/components/SideNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await tutorContext();
  const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending");
  return (
    <div className="wrap shell">
      <aside className="side">
        <div className="who"><span className="eyebrow">Lindsay&apos;s desk</span><b>{profile.full_name || "Lindsay"}</b></div>
        <SideNav links={[
          { href: "/admin", label: "Today", exact: true },
          { href: "/admin/bookings", label: `Bookings${count ? ` (${count} new)` : ""}` },
          { href: "/admin/availability", label: "Availability" },
          { href: "/admin/families", label: "Families & students" },
          { href: "/admin/messages", label: "Messages" },
        ]} />
        <form action={signOut} style={{ marginTop: ".5rem" }}><button className="btn ghost sm" type="submit">Sign out</button></form>
      </aside>
      <div>{children}</div>
    </div>
  );
}
