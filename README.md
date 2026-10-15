# Coastal Learning with Lindsay Gagnon

A complete website and client system for a private tutoring practice:

- Public site: brand, services, how it works, FAQ, and a live booking page that shows Lindsay's real open times.
- Booking engine: weekly availability windows plus time off, slot grid, lead time, double-booking prevention, email to both sides, confirm or decline from Lindsay's desk.
- Parent portal: per-child session briefings, progress by skill, work folder with uploads, upcoming sessions, and messaging with Lindsay.
- Lindsay's desk (admin): today's view, bookings, availability, families and students, writing briefings (saved and emailed), skill progress, private notes, messages.
- Online tutoring room: video call plus a shared whiteboard synced live between Lindsay and the student, a session timer and flashcards. Only the booked family and Lindsay can open a room.

Stack: Next.js 15 (App Router, server actions), Supabase (Postgres with row-level security, Auth, Storage, Realtime), Resend for email, Jitsi Meet for video. Hosted on Vercel. All of this runs on free tiers at a solo tutor's scale.

## Launch in about an hour

### 1. Supabase (database, logins, file storage)
1. Create a project at supabase.com. Pick a region near Lindsay (US East).
2. Open **SQL Editor**, paste the whole of `supabase/migrations/0001_schema.sql`, run it. This creates every table, the security rules, the file bucket and Lindsay's default hours (weekday afternoons, Saturday mornings).
3. **Authentication > Providers > Email**: leave Email on. Turn off "Confirm email" if you want invites to work without a second confirmation step (invites already prove the address).
4. **Authentication > URL Configuration**: set Site URL to your domain (for now, the Vercel URL) and add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.
5. **Authentication > Email Templates**: optional, but replace the default text so the invite reads like it is from Lindsay.
6. **Project Settings > API**: copy the Project URL, the `anon` key and the `service_role` key.

Lindsay's account is special. The schema marks whichever user signs up with the email in `app_settings.tutor_email` (set to lindsaykgagnon@gmail.com) as the tutor. To create it: **Authentication > Users > Add user**, enter that email and a password. She signs in at `/login` and lands on her desk. To change the tutor email, edit the row in `app_settings` before creating the user.

### 2. Resend (email)
1. Create an account at resend.com, add and verify the sending domain (or use `onboarding@resend.dev` to test).
2. Create an API key.

### 3. Vercel (hosting)
1. Push this folder to a GitHub repo and import it in Vercel.
2. Add the environment variables from `.env.example` (Supabase URL, anon key, service role key, Resend key, EMAIL_FROM, TUTOR_EMAIL, NEXT_PUBLIC_SITE_URL, TUTOR_TZ).
3. Deploy. Point the domain at Vercel when ready, then update NEXT_PUBLIC_SITE_URL and the Supabase Site URL to match.

### 4. First-run checklist
- Open `/book` as a visitor and request a consultation. Lindsay gets an email; the request appears on her desk.
- Sign in as Lindsay, confirm it. The parent gets the confirmation email.
- **Families & students > Add a family**: the parent receives an invite, sets a password at `/welcome`, and sees the portal. Any earlier booking requests from that email are linked to the family automatically.
- Open the student, write a briefing with "Email this briefing" checked. It lands in the portal and the parent's inbox.
- For an online booking, both sides see a "Join room" button once it is confirmed.

## Running locally
```
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Where things live
```
supabase/migrations/0001_schema.sql   tables, policies, storage bucket, default hours
src/app/page.tsx                      marketing site
src/app/book                          public booking page
src/app/login, /welcome, /auth        sign in, invite landing, magic-link callback
src/app/portal/**                     parent portal
src/app/admin/**                      Lindsay's desk
src/app/room/[room]                   online tutoring room
src/lib/slots.ts                      availability engine (timezone-aware)
src/lib/actions.ts                    every write: bookings, briefings, files, messages, admin
src/lib/email.ts                      all email templates
src/app/globals.css                   design tokens and components
```

## Security model, in short
Every table has row-level security. Parents can read only their own family's rows; Lindsay (the one `tutor` profile) can read and write everything; visitors can read only availability and a `public_busy` view that exposes busy times with no names attached. Files live in a private bucket and are served through ten-minute signed links. The service-role key is used server-side only, for creating families and sending invitations.

## Things to decide later
- Payments: a Stripe link per package can be added to the confirmation email; nothing in the code assumes a price.
- Video: Jitsi is free and needs no account. If Lindsay prefers Zoom or Google Meet, store the link in `bookings.video_room` and change the iframe in `TutoringRoom.tsx`.
- Reminders: a daily Vercel cron that emails tomorrow's families is a small addition to `src/lib/email.ts`.
