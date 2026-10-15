/** Supabase connection settings. Accepts both the legacy (anon/service_role) and the new (publishable/secret) key names,
 *  so the Vercel Supabase integration works out of the box whichever it injects. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "http://localhost:54321";
export const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "anon";
export const SUPABASE_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? SUPABASE_ANON;
