// A small, hand-drawn icon set for the public page. Same visual grammar
// everywhere: 24px grid, 1.6 stroke, square-ish geometry, no filled blobs.
// Keeping these local avoids the generic icon-pack look.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

const Svg = ({ children, className = '' }) => (
  <svg {...base} className={className}>{children}</svg>
)

export const MarkIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 8.5A4.5 4.5 0 0 1 8.5 4h7A4.5 4.5 0 0 1 20 8.5v7a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 15.5z" />
    <path d="M7.5 12h1.2M10.5 8.5v7M13.5 10v4M16.5 12h.8" />
  </Svg>
)

export const ArrowIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 12h15" />
    <path d="M13.5 6.5 19 12l-5.5 5.5" />
  </Svg>
)

export const PlayIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 8.6 15 12l-5 3.4z" />
  </Svg>
)

export const RoleIcon = ({ className }) => (
  <Svg className={className}>
    <rect x="3.5" y="7" width="12" height="12" rx="2" />
    <path d="M7.5 7V5.5A2.5 2.5 0 0 1 10 3h8a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 16h-1" />
    <path d="M7 11h5M7 14.5h3" />
  </Svg>
)

export const WaveIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 11v2M7 8v8M10 4.5v15M13 7v10M16 5.5v13M19 10v4" />
  </Svg>
)

export const OrbIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13" />
    <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7" />
  </Svg>
)

export const EvalIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
  </Svg>
)

export const ShieldIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 3.2 19 6v5.2c0 4.5-3 7.6-7 9.1-4-1.5-7-4.6-7-9.1V6z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </Svg>
)

export const ReportIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 4v16h16" />
    <path d="M8 16.5v-4M12 16.5V8M16 16.5v-6" />
  </Svg>
)

export const ResumeIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 15.5h6M9 19h3" />
  </Svg>
)

export const BoltIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M13 2.5 5.5 13H11l-1 8.5L18 11h-5.5z" />
  </Svg>
)

export const QuoteIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4.5 6h6v6H7.5c0 2-1 3.2-3 4" />
    <path d="M13.5 6h6v6h-3c0 2-1 3.2-3 4" />
  </Svg>
)

export const ClockIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const CheckIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 12.5 9 17.5 20 6.5" />
  </Svg>
)

export const ChatIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 5.5h16v10H9l-5 4z" />
    <path d="M12 8.5v2M12 13.2h.01" />
  </Svg>
)
