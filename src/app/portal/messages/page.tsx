import { parentContext, type Message } from "@/lib/data";
import MessageThread from "@/components/MessageThread";

export default async function Messages() {
  const { profile, family, supabase } = await parentContext();
  if (!family) return <div className="card"><h3>Messages</h3><p className="hint">Messaging opens once Lindsay sets up your family account.</p></div>;
  const { data } = await supabase.from("messages").select("*, profiles(full_name, role)").eq("family_id", family.id).order("created_at");
  return (
    <div className="card">
      <h3>Messages with Lindsay</h3>
      <p className="hint" style={{ marginBottom: "1rem" }}>Lindsay gets an email for every message. Rescheduling, questions, anything.</p>
      <MessageThread messages={(data ?? []) as Message[]} familyId={family.id} meId={profile.id} emptyText="No messages yet. Say hello." />
    </div>
  );
}
