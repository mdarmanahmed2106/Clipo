// AnonClip Logo SVG component
export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#5E5CE6" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="40" height="40" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <path d="M10 12V28M30 12V28" stroke="url(#logo-grad)" strokeWidth="3" strokeLinecap="round" filter="url(#logo-glow)"/>
      <rect x="15" y="16" width="10" height="12" rx="1" stroke="white" strokeWidth="2" opacity="0.9"/>
      <path d="M17 14H23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
    </svg>
  );
}
