export default function Logo({ variant = "dark", size = "default" }: { variant?: "dark" | "light"; size?: "default" | "large" }) {
  const textColor = variant === "light" ? "#ffffff" : "#0a2540";
  const accentColor = "#e8542f";
  const tealColor = "#0097a7";
  const w = size === "large" ? 320 : 280;
  const h = size === "large" ? 82 : 72;

  return (
    <svg width={w} height={h} viewBox="0 0 280 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon mark - abstract geometric triangles */}
      <g transform="translate(0,6)">
        <path d="M4 13L20 5L20 21L4 13Z" fill={accentColor} />
        <path d="M15 21L31 13L31 29L15 21Z" fill={tealColor} />
        <path d="M4 29L20 21L20 37L4 29Z" fill={accentColor} opacity="0.7" />
        <path d="M20 5L31 13L20 21L20 5Z" fill={tealColor} opacity="0.6" />
      </g>
      {/* SRS text */}
      <text x="40" y="33" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="30" letterSpacing="-0.5" fill={textColor}>
        SRS
      </text>
      {/* infoway text */}
      <text x="102" y="33" fontFamily="Inter, system-ui, sans-serif" fontWeight="300" fontSize="30" letterSpacing="-0.3" fill={textColor}>
        infoway
      </text>
      {/* Tagline */}
      <text x="40" y="52" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="10" letterSpacing="3" fill={accentColor}>
        OWN TRANSFORMATION
      </text>
    </svg>
  );
}
