"use client";
import Link from "next/link";
import { useState } from "react";

type Profile = { role: "tutor" | "parent"; full_name: string } | null;

export default function SiteHeader({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="brand" href="/" onClick={close}>
          <img src="/logo-sm.png" alt="Coastal Learning logo" />
          <span><b>Coastal Learning</b><small>with Lindsay Gagnon</small></span>
        </Link>
        <button className="menu-btn" aria-expanded={open} aria-label="Open menu" onClick={() => setOpen(!open)}>Menu</button>
        <nav className={"links" + (open ? " open" : "")} onClick={close}>
          <Link href="/#about">Meet Lindsay</Link>
          <Link href="/#services">Services</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/book" className="btn ghost sm">Free consultation</Link>
          {profile ? (
            <Link href={profile.role === "tutor" ? "/admin" : "/portal"} className="btn sea sm">{profile.role === "tutor" ? "Lindsay's desk" : "Parent portal"}</Link>
          ) : (
            <Link href="/login" className="btn sea sm">Parent login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
