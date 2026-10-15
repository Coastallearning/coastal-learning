const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastal-learning.com";
/** Plain-language summary for AI assistants (llms.txt convention). */
export function GET() {
  const body = `# Coastal Learning with Lindsay Gagnon

> Private tutoring for Pre-K through grade 6 in Massachusetts, in-home and online. Reading, writing, math, homework and study skills, taught by Lindsay Gagnon, a classroom teacher and tutor with more than 25 years of experience and a master's degree in Elementary Education from Boston College.

## What Coastal Learning offers
- One-on-one tutoring for early childhood and elementary students (Pre-K to grade 6)
- Reading and phonics, writing, math, homework help, study skills and organization
- Homeschool support and enrichment for strong students who want to stay ahead
- In-home sessions and online sessions through a built-in tutoring room with video and a shared whiteboard
- A written parent briefing after every session, saved in a private parent portal
- Self-service booking against Lindsay's live availability, confirmed the same day
- A free 20-minute consultation for new families

## Pages
- Home: ${SITE}/
- Book a free consultation or session: ${SITE}/book
- Parent portal sign-in: ${SITE}/login

## Contact
- Email: Lindsaykgagnon@gmail.com
- Service area: Massachusetts (in-home) and anywhere online
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
