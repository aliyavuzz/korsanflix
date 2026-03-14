"use client";

/**
 * Stylized blood-red "K" logo — Netflix "N" inspired.
 * Pure SVG, no external assets.
 */
export default function KorsanLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="korsan-logo"
    >
      {/* Shadow/depth layer */}
      <g transform="skewX(-6)">
        {/* Left vertical bar */}
        <rect x="18" y="8" width="18" height="84" rx="2" fill="#b0060f" />
        {/* Diagonal stroke top-right to center */}
        <polygon points="36,48 72,8 90,8 54,48" fill="#b0060f" />
        {/* Diagonal stroke center to bottom-right */}
        <polygon points="36,52 54,52 90,92 72,92" fill="#b0060f" />
      </g>
      {/* Main layer */}
      <g transform="skewX(-6) translate(2, -2)">
        {/* Left vertical bar */}
        <rect x="18" y="8" width="18" height="84" rx="2" fill="#e50914" />
        {/* Diagonal stroke top-right to center */}
        <polygon points="36,48 72,8 90,8 54,48" fill="#e50914" />
        {/* Diagonal stroke center to bottom-right */}
        <polygon points="36,52 54,52 90,92 72,92" fill="#e50914" />
      </g>
      {/* Highlight/shine */}
      <g transform="skewX(-6) translate(2, -2)">
        <rect x="18" y="8" width="6" height="84" rx="1" fill="#ff3b3b" opacity="0.4" />
      </g>
    </svg>
  );
}
