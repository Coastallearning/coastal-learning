import type { Message } from "@/lib/data";
import { sendMessage } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

export default function MessageThread({ messages, familyId, meId, emptyText }: { messages: Message[]; familyId: string; meId: string; emptyText: string }) {
  return (
    <div>
      <div className="msgs">
        {messages.length === 0 && <p className="hint">{emptyText}</p>}
        {messages.map((m) => (
          <div className={"msg " + (m.sender_id === meId ? "me" : "them")} key={m.id}>
            {m.body}
            <small>{m.sender_id === meId ? "You" : m.profiles?.role === "tutor" ? "Lindsay" : m.profiles?.full_name || "Family"} · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(m.created_at))}</small>
          </div>
        ))}
      </div>
      <ActionForm action={sendMessage} className="row">
        <input type="hidden" name="family_id" value={familyId} />
        <input name="body" id={`msg-${familyId}`} placeholder="Write a message" required style={{ flex: 1 }} autoComplete="off" />
        <button className="btn sm" type="submit">Send</button>
      </ActionForm>
    </div>
  );
}
