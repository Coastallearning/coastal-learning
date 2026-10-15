import { createClient } from "@/lib/supabase/server";

export async function childOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("children").select("id, first_name, families(name)").order("first_name");
  return (data ?? []).map((c) => ({ id: c.id, first_name: c.first_name, family: (c as unknown as { families: { name: string } | null }).families?.name ?? "" }));
}
