export function CompassIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="29" stroke="#c9a227" strokeWidth="2.2" fill="#2a1f14" />
      <circle cx="32" cy="32" r="24" stroke="#e8d5b0" strokeWidth="1" fill="#3a2c1c" />
      <path d="M32 8 L36 32 L32 28 L28 32 Z" fill="#c9a227" />
      <path d="M32 56 L28 32 L32 36 L36 32 Z" fill="#e8d5b0" />
      <path d="M8 32 L32 28 L28 32 L32 36 Z" fill="#8a7350" />
      <path d="M56 32 L32 36 L36 32 L32 28 Z" fill="#8a7350" />
      <circle cx="32" cy="32" r="3.2" fill="#c9a227" stroke="#2a1f14" strokeWidth="1" />
      <text x="32" y="16" textAnchor="middle" fill="#c9a227" fontSize="7" fontFamily="serif">
        N
      </text>
    </svg>
  );
}
