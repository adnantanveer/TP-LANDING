/**
 * Inline brand SVGs for the technologies Techpotam masters.
 * Using inline SVGs keeps them crisp at any size and recolourable.
 */
import type { ComponentType } from "react";

type IconProps = { className?: string };

export const ReactLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 128 128" className={className} aria-hidden>
    <circle cx="64" cy="64" r="10" fill="currentColor" />
    <g fill="none" stroke="currentColor" strokeWidth="5">
      <ellipse cx="64" cy="64" rx="56" ry="22" />
      <ellipse cx="64" cy="64" rx="56" ry="22" transform="rotate(60 64 64)" />
      <ellipse cx="64" cy="64" rx="56" ry="22" transform="rotate(120 64 64)" />
    </g>
  </svg>
);

export const AngularLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path fill="currentColor" d="M128 20 24 60l16 132 88 44 88-44 16-132L128 20zm0 38 56 124-56-22v-2l-56 22L128 58z" />
  </svg>
);

export const VueLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 221" className={className} aria-hidden>
    <path fill="currentColor" d="M0 0h44l84 140L212 0h44L128 221z" opacity="0.9" />
    <path fill="currentColor" opacity="0.5" d="M48 0h40l40 67 40-67h40L128 140z" />
  </svg>
);

export const NextLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <circle cx="128" cy="128" r="116" fill="none" stroke="currentColor" strokeWidth="14" />
    <path fill="currentColor" d="M176 64v128l-54-80-20 30V64h20v64l54 80V64z" />
  </svg>
);

export const TsLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <rect width="256" height="256" rx="40" fill="currentColor" />
    <path
      fill="#0a0a0a"
      d="M96 96H40v22h18v62h22v-62h18V96zm104 26c-6-4-14-6-24-6-10 0-18 2-24 6-6 4-9 10-9 18 0 8 4 14 14 18l22 8c4 2 6 4 6 7s-3 5-9 5c-8 0-14-3-18-9l-16 10c8 12 20 18 34 18 9 0 16-2 22-6 6-4 10-10 10-18 0-8-5-14-15-18l-22-8c-4-2-5-3-5-5s3-4 8-4c6 0 11 2 14 6l16-10z"
    />
  </svg>
);

export const NodeLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path fill="none" stroke="currentColor" strokeWidth="12" d="M128 24 232 80v96L128 236 24 176V80z" />
    <text
      x="128"
      y="150"
      textAnchor="middle"
      fontFamily="monospace"
      fontSize="64"
      fontWeight="700"
      fill="currentColor"
    >
      N
    </text>
  </svg>
);

export const MongoLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M128 18c-3 14-9 26-18 36-9 10-20 16-34 18-2 28 7 56 20 78 9 14 20 25 34 34-2 10-5 21-5 32v24c-12-9-21-21-28-34-9-18-14-38-14-62 0-4-2-7-5-7s-4 3-4 7c2 30 11 55 28 76 9 11 20 20 32 27-2 12-5 23-5 34 0 3 2 5 5 5s4-2 4-5c0-9 2-18 4-27 9 2 18 4 27 4 7 0 11-2 11-7 0-23-4-43-13-61 9-9 16-20 20-33 7-20 7-43 0-66-2-5-5-7-9-7s-6 2-6 7c2 16 0 32-9 45-7 9-15 16-25 20 2-16 0-30-5-43-2-7-7-11-13-13z"
    />
  </svg>
);

export const PostgresLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <ellipse cx="128" cy="128" rx="104" ry="64" fill="none" stroke="currentColor" strokeWidth="12" />
    <ellipse cx="128" cy="128" rx="104" ry="32" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.6" />
    <circle cx="128" cy="96" r="10" fill="currentColor" />
    <circle cx="80" cy="140" r="10" fill="currentColor" />
    <circle cx="176" cy="140" r="10" fill="currentColor" />
  </svg>
);

export const AwsLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 160" className={className} aria-hidden>
    <text
      x="128"
      y="92"
      textAnchor="middle"
      fontFamily="sans-serif"
      fontSize="60"
      fontWeight="800"
      fill="currentColor"
    >
      aws
    </text>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      d="M40 122c30 24 116 24 176 0"
    />
  </svg>
);

export const AzureLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path fill="currentColor" d="M96 40 16 216h96l32-72 48 72h64L160 40h-32l-48 112L96 40z" />
  </svg>
);

export const DockerLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 185" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M232 78c-10-6-24-6-34-2-3-14-12-26-24-34l-8-6-6 8c-10 14-14 32-10 48 2 6 6 12 10 16-8 4-22 8-38 8H8c-2 22 8 50 32 64 18 11 40 16 64 16 48 0 84-22 104-64 14 0 22-6 26-12l4-6-6-6c-2-2-8-6-8-16z"
    />
    <g fill="currentColor">
      <rect x="40" y="58" width="22" height="22" rx="3" />
      <rect x="68" y="58" width="22" height="22" rx="3" />
      <rect x="96" y="58" width="22" height="22" rx="3" />
      <rect x="68" y="30" width="22" height="22" rx="3" />
      <rect x="96" y="30" width="22" height="22" rx="3" />
      <rect x="124" y="58" width="22" height="22" rx="3" />
    </g>
  </svg>
);

export const PythonLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M128 16c-30 0-36 14-36 36v18h36v6H54c-22 0-38 14-38 38s16 38 38 38h16v-22c0-22 16-36 36-36h36c18 0 28-14 28-30V52c0-22-18-36-40-36h-16zm-16 22c6 0 12 4 12 12s-6 12-12 12-12-4-12-12 6-12 12-12z"
      opacity="0.9"
    />
    <path
      fill="currentColor"
      opacity="0.5"
      d="M160 180v-18c0-22-16-36-36-36h-36c-18 0-28-14-28-30V52c0-22 18-36 40-36h16c30 0 36 14 36 36v18h-36v6h54c22 0 38 14 38 38s-16 38-38 38h-16v-22c0-22-16-36-36-36h-36zm-16 22c-6 0-12-4-12-12s6-12 12-12 12 4 12 12-6 12-12 12z"
    />
  </svg>
);

export const GraphqlLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <g fill="none" stroke="currentColor" strokeWidth="8">
      <polygon points="128,24 220,78 220,180 128,234 36,180 36,78" />
      <line x1="128" y1="24" x2="128" y2="234" />
      <line x1="36" y1="78" x2="220" y2="180" />
      <line x1="220" y1="78" x2="36" y2="180" />
    </g>
    <g fill="currentColor">
      <circle cx="128" cy="24" r="12" />
      <circle cx="220" cy="78" r="12" />
      <circle cx="220" cy="180" r="12" />
      <circle cx="128" cy="234" r="12" />
      <circle cx="36" cy="180" r="12" />
      <circle cx="36" cy="78" r="12" />
    </g>
  </svg>
);

export const SupabaseLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 256" className={className} aria-hidden>
    <path fill="currentColor" d="M140 24 36 150h76l-16 82 104-126h-76l16-82z" />
  </svg>
);

export const TailwindLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 160" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M128 16c-32 0-52 16-60 48 12-16 26-22 42-18 9 2 16 9 23 17 12 13 26 28 56 28 32 0 52-16 60-48-12 16-26 22-42 18-9-2-16-9-23-17-12-13-26-28-56-28zM68 80c-32 0-52 16-60 48 12-16 26-22 42-18 9 2 16 9 23 17 12 13 26 28 56 28 32 0 52-16 60-48-12 16-26 22-42 18-9-2-16-9-23-17-12-13-26-28-56-28z"
    />
  </svg>
);

export const RedisLogo: ComponentType<IconProps> = ({ className }) => (
  <svg viewBox="0 0 256 220" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M128 16 16 70l112 54 112-54L128 16zm0 78L16 148l112 54 112-54-112-54z"
      opacity="0.85"
    />
  </svg>
);
