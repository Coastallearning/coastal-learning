import Link from "next/link";
import Logo from "@/components/Logo";

const Book = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z" /></svg>;
const Sprout = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V10M12 10c0-4 3-7 8-7 0 5-3 8-8 7zM12 14c0-3-2-6-7-6 0 4 2 7 7 6z" /></svg>;
const Sun = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>;
const Cap = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" /></svg>;
const People = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-1.5-5-4-5.5" /></svg>;
const Mail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18v12H3zM3 7l9 6 9-6" /></svg>;
const Cal = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>;
const Folder = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h10l6 6v10H4z" /><path d="M14 4v6h6M8 14h8M8 18h5" /></svg>;
const Video = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="14" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></svg>;

export default function Home() {
  return (
    <>
      <section className="hero">
        <svg className="pebble" style={{ left: -30, top: 40, width: 150 }} viewBox="0 0 100 100" aria-hidden="true"><path fill="var(--sea)" d="M48 4c22-5 48 10 50 34 2 25-16 56-44 58C26 98 2 78 2 50 2 26 24 9 48 4z" /></svg>
        <svg className="pebble" style={{ right: -20, top: 120, width: 110 }} viewBox="0 0 100 100" aria-hidden="true"><path fill="var(--glass)" opacity=".55" d="M52 2c26 0 46 22 46 48s-18 48-46 48S4 76 4 50 26 2 52 2z" /></svg>
        <svg className="pebble" style={{ right: "14%", bottom: -30, width: 90 }} viewBox="0 0 100 100" aria-hidden="true"><path fill="var(--sage-light)" d="M40 6c30-10 60 12 58 42-2 28-26 50-52 50S0 78 2 50C4 28 18 13 40 6z" /></svg>
        <div className="wrap">
          <div className="stack">
            <span className="eyebrow">Personalized support for early childhood &amp; elementary students</span>
            <h1>Your child doesn&apos;t have to be struggling to benefit from a <b>tutor.</b></h1>
            <p className="sub">A little support now can prevent a lot of frustration later.</p>
            <p className="lead">One-on-one reading, writing, math, homework and study-skills support for Pre-K through grade 6, in your home or online, from a teacher with more than 25 years of experience. Every session ends with a written briefing for you.</p>
            <div className="cta-row">
              <Link className="btn" href="/book">Schedule your free consultation</Link>
              <Link className="btn ghost" href="#about">Meet Lindsay</Link>
            </div>
            <div className="pill-row"><span>Now accepting new students</span><span>In-home &amp; online</span><span>Pre-K to grade 6</span></div>
          </div>
          <div className="hero-logo"><Logo size={320} /></div>
        </div>
      </section>

      <section>
        <div className="wrap pillars">
          <div className="pillar"><div className="ico"><Book /></div><h3>Build skills</h3><p>Phonics, fluency, writing, math facts and problem solving, taught the way each child learns best.</p></div>
          <div className="pillar"><div className="ico"><Sprout /></div><h3>Build confidence</h3><p>Small wins, celebrated often. Kids leave sessions believing they can do hard things.</p></div>
          <div className="pillar"><div className="ico"><Sun /></div><h3>Stay ahead</h3><p>Enrichment and previewing for strong students who want to keep their momentum going.</p></div>
        </div>
      </section>

      <section className="band" id="about">
        <div className="wrap about">
          <img className="portrait" src="/headshot.jpg" alt="Lindsay Gagnon smiling on a beach" />
          <div>
            <span className="eyebrow">Meet</span>
            <h2><span className="script">Lindsay Gagnon</span></h2>
            <p className="lead" style={{ marginTop: ".8rem" }}>Lindsay is a classroom teacher and private tutor who has spent more than 25 years helping young learners find their footing. She works with families and teachers together, so what happens in a session connects to what is happening at school.</p>
            <div className="creds">
              <div className="cred"><div className="ico"><Cap /></div><div><b>Master&apos;s degree in Elementary Education</b><br /><span className="hint">Boston College</span></div></div>
              <div className="cred"><div className="ico"><People /></div><div><b>More than 25 years of experience</b><br /><span className="hint">as a teacher and private tutor</span></div></div>
              <div className="cred"><div className="ico"><Book /></div><div><b>Tutoring for students in Pre-K through grade 6</b><br /><span className="hint">patient, personalized support that builds skills and confidence</span></div></div>
            </div>
            <div className="subjects"><span>Reading</span><span>Writing</span><span>Math</span><span>Homework</span><span>Study skills</span><span>Organization</span></div>
          </div>
        </div>
      </section>

      <section id="services">
        <div className="wrap">
          <div className="center stack" style={{ justifyItems: "center", marginBottom: "2rem" }}>
            <span className="eyebrow">Services</span>
            <h2>Support that fits your child and your week</h2>
            <p className="lead">Every plan starts with a free consultation and a short, friendly assessment so Lindsay knows exactly where to begin.</p>
          </div>
          <div className="services">
            <div className="service"><span className="who">Pre-K &amp; Kindergarten</span><h3>Early learners</h3><p>Letters and sounds, early numbers, listening and fine-motor skills, all through play.</p><ul><li>School readiness</li><li>Phonological awareness</li><li>Counting and number sense</li></ul></div>
            <div className="service"><span className="who">Grades 1 to 3</span><h3>Reading &amp; writing</h3><p>Phonics, fluency, comprehension and the first steps of confident writing.</p><ul><li>Decoding and sight words</li><li>Reading comprehension</li><li>Sentences to paragraphs</li></ul></div>
            <div className="service"><span className="who">Grades 1 to 6</span><h3>Math</h3><p>Fact fluency, place value, fractions and word problems, explained until they click.</p><ul><li>Math facts and strategies</li><li>Multi-step problem solving</li><li>Test and quiz preparation</li></ul></div>
            <div className="service"><span className="who">Grades 3 to 6</span><h3>Homework &amp; study skills</h3><p>A calm weekly rhythm for homework, projects and organization.</p><ul><li>Planning and time management</li><li>Note-taking and studying</li><li>Executive-function habits</li></ul></div>
            <div className="service"><span className="who">Homeschool families</span><h3>Homeschool support</h3><p>You don&apos;t have to do it all alone. Curriculum support, subject help and reinforcement.</p><ul><li>Academic support</li><li>Skill building</li><li>Confidence and independence</li></ul></div>
            <div className="service"><span className="who">Strong students</span><h3>Enrichment</h3><p>For kids who aren&apos;t struggling but want to stay ahead and love learning.</p><ul><li>Previewing next units</li><li>Reading and writing projects</li><li>Logic and math challenges</li></ul></div>
          </div>
        </div>
      </section>

      <section className="band" id="how">
        <div className="wrap">
          <div className="center stack" style={{ justifyItems: "center", marginBottom: "2rem" }}>
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a confident learner</h2>
          </div>
          <div className="steps">
            <div className="step"><h3>Free consultation</h3><p>A relaxed 20-minute conversation about your child, your goals and your schedule. In-home or online, your choice.</p></div>
            <div className="step"><h3>Personalized plan</h3><p>Lindsay meets your child, does a short assessment and builds a plan around their strengths and the skills that need the most support.</p></div>
            <div className="step"><h3>Sessions and briefings</h3><p>Weekly sessions with a healthy snack and drink included. After every session you receive a written briefing with progress, focus areas and next steps.</p></div>
          </div>
          <div className="center stack" style={{ justifyItems: "center", margin: "3rem 0 1.5rem" }}>
            <h2>What makes Coastal Learning different</h2>
            <p className="lead">Most tutoring sites stop at a contact form. Families here get a complete picture of their child&apos;s progress, every week.</p>
          </div>
          <div className="diffs">
            <div className="diff"><div className="ico"><Mail /></div><div><h3>A briefing after every session</h3><p>Not a vague &ldquo;went great.&rdquo; A short written note on what was covered, what clicked, and what to practice at home.</p></div></div>
            <div className="diff"><div className="ico"><Cal /></div><div><h3>Book around real availability</h3><p>See open times and reserve a session or consultation yourself, no back-and-forth emails.</p></div></div>
            <div className="diff"><div className="ico"><Folder /></div><div><h3>A parent portal that keeps everything</h3><p>Your child&apos;s work, briefings, progress by skill and upcoming sessions, all in one private place.</p></div></div>
            <div className="diff"><div className="ico"><Video /></div><div><h3>Online sessions that feel in-person</h3><p>A tutoring room with video, a shared whiteboard, flashcards and a timer, built for young learners and short attention spans.</p></div></div>
          </div>
          <div className="center" style={{ marginTop: "2.5rem" }}><Link className="btn" href="/book">See open times</Link></div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap narrow">
          <div className="center stack" style={{ justifyItems: "center", marginBottom: "1.5rem" }}>
            <span className="eyebrow">Questions parents ask</span>
            <h2>FAQ</h2>
          </div>
          <details open><summary>My child isn&apos;t behind. Is tutoring still worth it?</summary><p>Yes. Many of Lindsay&apos;s students are doing fine at school and come for confidence, enrichment or a steady routine. A little support now can prevent a lot of frustration later, especially before big transitions like starting chapter books or multi-digit math.</p></details>
          <details><summary>In-home or online, which is better?</summary><p>Younger children usually do best in-home, where Lindsay can use hands-on materials. Online works well from about second grade up, and the tutoring room keeps sessions interactive. Many families mix both.</p></details>
          <details><summary>How often should we meet?</summary><p>Once a week is the most common rhythm. Twice a week helps when a child is catching up on a specific skill or preparing for a transition. Lindsay will recommend a plan after the consultation.</p></details>
          <details><summary>What happens after each session?</summary><p>You receive a parent briefing by email, and it is saved in your portal. It covers what was worked on, what went well, what to watch for and one or two simple things to practice at home.</p></details>
          <details><summary>Do you work with my child&apos;s teacher?</summary><p>With your permission, yes. Lindsay is happy to coordinate with classroom teachers and specialists so that tutoring supports what is happening at school.</p></details>
          <details><summary>What does it cost?</summary><p>Rates depend on session length and format. Lindsay will walk you through options during your free consultation, with no pressure to decide on the spot.</p></details>
        </div>
      </section>
    </>
  );
}
