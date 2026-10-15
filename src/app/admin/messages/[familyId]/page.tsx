import { notFound } from "next/navigation";
import { tutorContext, type Message } from "@/lib/data";
import MessageThread from "@/components/MessageThread";

export default async function FamilyMessages({ params }: { params: Promise<{ familyId: string }> }) {
  const { familyId } = await params;
  const { supabase, profile } = await tutorContext();
  const { data: fam } = await supabase.from("families").select("id, name").eq("id", familyId).single();
  if (!fam) notFound();
  const { data } = await supabase.from("messages").select("*, profiles(full_name, role)").eq("family_id", familyId).order("created_at");
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("family_id", familyId).is("read_at", null).neq("sender_id", profile.id);
  return (
    <div className="card">
      <h3>{fam.name}</h3>
      <MessageThread messages={(data ?? []) as Message[]} familyId={familyId} meId={profile.id} emptyText="No messages yet." />
    </div>
  );
}
