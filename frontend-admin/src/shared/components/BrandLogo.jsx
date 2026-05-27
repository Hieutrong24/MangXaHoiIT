export default function BrandLogo({ className = '', compact = false }) {
  return (
    <div className={`brand-logo ${className}`.trim()}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="logoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#73d7ff" />
            <stop offset="55%" stopColor="#7f7cff" />
            <stop offset="100%" stopColor="#9c6cff" />
          </linearGradient>
        </defs>
        <path d="M60 8l37 21.5v43L60 94 23 72.5v-43L60 8z" fill="url(#logoGradient)" opacity="0.95" />
        <path d="M60 19l27 15.7v31.6L60 82 33 66.3V34.7L60 19z" fill="#071224" opacity="0.9" />
        <path d="M46 44.5L36 54l10 9.5M74 44.5L84 54l-10 9.5M55.5 67l9-26" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {!compact ? (
        <div>
          <div className="brand-title">IT Social</div>
          <div className="brand-subtitle">Admin Control Center</div>
        </div>
      ) : null}
    </div>
  );
}
