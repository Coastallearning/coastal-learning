import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <h4>Coastal Learning</h4>
          <p className="script">with Lindsay Gagnon</p>
          <p style={{ marginTop: ".6rem", maxWidth: "40ch" }}>Building confidence, inspiring learning. Personalized support for early childhood and elementary students.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p><a href="mailto:Lindsaykgagnon@gmail.com">Lindsaykgagnon@gmail.com</a></p>
          <p style={{ marginTop: ".5rem" }}>In-home &amp; online sessions available</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <p><Link href="/book">Schedule a free consultation</Link></p>
          <p><Link href="/portal">Parent portal</Link></p>
          <p><Link href="/login">Sign in</Link></p>
          <small>© {new Date().getFullYear()} Coastal Learning with Lindsay Gagnon</small>
        </div>
      </div>
    </footer>
  );
}
