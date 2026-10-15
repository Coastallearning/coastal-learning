"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav({ links }: { links: { href: string; label: string; sub?: string; exact?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav style={{ display: "grid", gap: ".2rem" }}>
      {links.map((l) => {
        const on = l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} className={on ? "on" : ""}>
            {l.sub ? <span className="kidbtn"><span className="av">{l.label[0]}</span><span>{l.label}<br /><small className="hint">{l.sub}</small></span></span> : l.label}
          </Link>
        );
      })}
    </nav>
  );
}
