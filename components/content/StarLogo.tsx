interface StarLogoProps {
  size?: number;
  className?: string;
  onDark?: boolean;
}

export function StarLogo({ size = 48, className = "", onDark = false }: StarLogoProps) {
  const hi  = onDark ? "#C8D4E0" : "#222222";
  const mid = onDark ? "#8A9BAD" : "#555555";
  const ctr = onDark ? "#E8EFF5" : "#111111";
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M50 0 L58 50 L50 55 L42 50 Z"       fill={hi}  opacity="0.9" />
      <path d="M50 0 L42 50 L50 55 Z"               fill={mid} opacity="0.7" />
      <path d="M50 130 L58 75 L50 70 L42 75 Z"      fill={hi}  opacity="0.8" />
      <path d="M50 130 L42 75 L50 70 Z"             fill={mid} opacity="0.6" />
      <path d="M100 62 L58 54 L55 62 L58 70 Z"      fill={hi}  opacity="0.85" />
      <path d="M100 62 L58 70 L55 62 Z"             fill={mid} opacity="0.65" />
      <path d="M0 62 L42 54 L45 62 L42 70 Z"        fill={hi}  opacity="0.8" />
      <path d="M0 62 L42 70 L45 62 Z"               fill={mid} opacity="0.6" />
      <path d="M50 55 L58 62 L50 70 L42 62 Z"       fill={ctr} />
    </svg>
  );
}
