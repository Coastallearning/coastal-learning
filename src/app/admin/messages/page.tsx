import Link from "next/link";
import { tutorContext } from "@/lib/data";

export default async function MessagesIndex() {
  const { supabase } = await tutorContext();
  const { data: families } = await supabase.from("families").select("id, name, messages(created_at, read_at, sender_id)").order("name");
  type Fam = { id: string; name: string; messages: { created_at: string; read_at: string | null }[] };
  const rows = ((families ?? []) as Fam[]).map((f) => ({ ...f, last: f.messages.map((m) => m.created_at).sort().pop() ?? null, unread: f.messages.filter((m) => !m.read_at).length }))
    .sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
  return (
    <div className="card">
      <h3>Messages</h3>
      {!rows.length && <p className="hint">Conversations appear here once you have families.</p>}
      <div className="list">
        {rows.map((f) => (
          <Link className="item" key={f.id} href={`/admin/messages/${f.id}`} style={{ textDecoration: "none" }}>
            <span style={{ minWidth: 0 }}><b>{f.name}</b><small>{f.last ? `Last message ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(f.last))}` : "No messages yet"}</small></span>
            {f.unread > 0 && <span className="chip right">{f.unread} unread</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
