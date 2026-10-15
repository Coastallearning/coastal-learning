import { notFound } from "next/navigation";
import { createClient, currentProfile } from "@/lib/supabase/server";
import TutoringRoom from "@/components/TutoringRoom";
import { fmtDateTime, SESSION_LABEL } from "@/lib/slots";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const profile = await currentProfile();
  const supabase = await createClient();
  // RLS: only Lindsay and the booked family can read this booking, so anyone else gets a 404.
  const { data: b } = await supabase.from("bookings").select("id, starts_at, type, child_name, status").eq("video_room", room).maybeSingle();
  if (!b || !profile) notFound();
  return (
    <div className="wrap">
      <div className="toolbar-row" style={{ marginTop: "1rem" }}>
        <div><span className="eyebrow">Online tutoring room</span><h2 style={{ fontSize: "1.8rem" }}>{b.child_name} · {fmtDateTime(new Date(b.starts_at))}</h2></div>
        <span className="hint">{SESSION_LABEL[b.type as keyof typeof SESSION_LABEL]}</span>
      </div>
      <TutoringRoom room={room} displayName={profile.role === "tutor" ? "Lindsay" : profile.full_name || b.child_name} isTutor={profile.role === "tutor"} />
    </div>
  );
}
