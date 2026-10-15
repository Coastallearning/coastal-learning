import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_URL as URL, SUPABASE_ANON as ANON, SUPABASE_SECRET } from "./env";


/** Supabase client bound to the signed-in user's cookies (RLS applies). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* called from a Server Component; middleware refreshes the session instead */
        }
      },
    },
  });
}

/** Service-role client. Server only. Bypasses RLS: use for admin tasks such as inviting families. */
export function createAdminClient() {
  return createBareClient(URL, SUPABASE_SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function currentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as { id: string; role: "tutor" | "parent"; full_name: string; email: string } | null;
}
