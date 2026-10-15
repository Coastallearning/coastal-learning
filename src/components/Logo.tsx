/**
 * Coastal Learning logo, drawn as vector so the ring is a perfect circle at every size.
 * Same elements as Lindsay's original: sea-glass pebbles, navy double ring, serif wordmark,
 * script name, open book, tagline, email, and the curved motto.
 */
export default function Logo({ size = 320, compact = false, className = "", title = "Coastal Learning with Lindsay Gagnon" }: { size?: number; compact?: boolean; className?: string; title?: string }) {
  const navy = "#1f3764", sage = "#7f9f8a", sea = "#a9d6d4", glassBlue = "#2f63b5", glassDeep = "#1d3f7f", glassGreen = "#8dbfae", glassAqua = "#9fd3dc";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 400 400" role="img" aria-label={title}>
      <defs>
        <linearGradient id="cl-g-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c7e3d6" /><stop offset="1" stopColor={glassGreen} /></linearGradient>
        <linearGradient id="cl-g-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5f8fd6" /><stop offset=".55" stopColor={glassBlue} /><stop offset="1" stopColor={glassDeep} /></linearGradient>
        <linearGradient id="cl-g-aqua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d2eef2" /><stop offset="1" stopColor={glassAqua} /></linearGradient>
        <path id="cl-arc" d="M 79 317 A 168 168 0 0 0 321 317" />
      </defs>
      <circle cx="200" cy="200" r="196" fill="#ffffff" />
      <circle cx="200" cy="200" r="194" fill="none" stroke={navy} strokeWidth="3.5" />
      <circle cx="200" cy="200" r="184" fill="none" stroke={sage} strokeWidth="1.6" />
      {/* sea glass */}
      <path d="M132 84c12-24 44-32 60-16 12 12 8 36-10 46-16 9-40 8-50-4-9-8-8-16 0-26z" fill="url(#cl-g-green)" />
      <path d="M176 52c10-26 46-36 64-16 14 16 12 44-6 60-18 14-46 12-58-4-10-12-8-26 0-40z" fill="url(#cl-g-blue)" />
      <path d="M240 82c14-18 42-20 54-4 10 14 4 34-12 42-16 8-36 6-46-6-8-8-6-18 4-32z" fill="url(#cl-g-aqua)" />
      <path d="M190 64c8-8 20-12 28-8" stroke="#ffffff" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* wordmark */}
      <text x="200" y="160" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="56" fontWeight="600" fill={navy} letterSpacing="1">Coastal</text>
      <text x="200" y="203" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="46" fontWeight="500" fill={sage} letterSpacing="4">Learning</text>
      {!compact && <>
        <text x="200" y="219" textAnchor="middle" fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="11" fill="#5f6c80">with</text>
        <text x="100" y="248" fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="14" fill={sea}>♥</text>
        <text x="205" y="250" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="34" fontWeight="600" fill={navy}>Lindsay Gagnon</text>
        {/* open book */}
        <path d="M174 262c9-6 18-7 26-3 8-4 17-3 26 3v20c-9-5-18-6-26-2-8-4-17-3-26 2z" fill="none" stroke={navy} strokeWidth="2" strokeLinejoin="round" />
        <path d="M200 259v22" stroke={navy} strokeWidth="2" />
        <path d="M180 269c7-3 12-3 17-1M180 276c7-3 12-3 17-1M203 268c5-2 10-2 17 1M203 275c5-2 10-2 17 1" stroke={sea} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <text x="200" y="296" textAnchor="middle" fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="10.5" fontWeight="800" letterSpacing="1.6" fill={navy}>PERSONALIZED SUPPORT FOR</text>
        <text x="200" y="308" textAnchor="middle" fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="9.2" fontWeight="800" letterSpacing="1.1" fill={navy}>EARLY CHILDHOOD &amp; ELEMENTARY STUDENTS</text>
        <text x="200" y="324" textAnchor="middle" fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill={navy}>Lindsaykgagnon@gmail.com</text>
        <text fontFamily="'Nunito Sans', system-ui, sans-serif" fontSize="8.6" fontWeight="800" letterSpacing="1" fill={navy}>
          <textPath href="#cl-arc" startOffset="50%" textAnchor="middle">BUILDING CONFIDENCE, INSPIRING LEARNING</textPath>
        </text>
      </>}
      {compact && <>
        <text x="200" y="262" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="40" fontWeight="600" fill={navy}>Lindsay Gagnon</text>
        <path d="M168 290c11-7 22-8 32-3 10-5 21-4 32 3v26c-11-6-22-7-32-2-10-5-21-4-32 2z" fill="none" stroke={navy} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M200 287v28" stroke={navy} strokeWidth="2.4" />
      </>}
    </svg>
  );
}
