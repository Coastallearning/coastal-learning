import Link from "next/link";
import { parentContext } from "@/lib/data";
import { signOut } from "@/lib/actions";
import SideNav from "@/components/SideNav";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile, family, children: kids } = await parentContext();
  const links = [
    ...kids.map((k) => ({ href: `/portal/child/${k.id}`, label: k.first_name, sub: k.grade })),
    { href: "/portal/messages", label: "Messages with Lindsay" },
  ];
  return (
    <div className="wrap shell">
      <aside className="side">
        <div className="who"><span className="eyebrow">Parent portal</span><b>{family?.name ?? profile.full_name}</b><span className="hint">{profile.email}</span></div>
        <SideNav links={links} />
        <Link href="/book" style={{ fontSize: ".92rem" }}>Book another session</Link>
        <form action={signOut} style={{ marginTop: ".5rem" }}><button className="btn ghost sm" type="submit">Sign out</button></form>
      </aside>
      <div>{children}</div>
    </div>
  );
}
