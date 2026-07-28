export function WebIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon" aria-hidden="true">
      <rect className="icon-draw" x="4" y="8" width="40" height="32" rx="4" />
      <line className="icon-draw" x1="4" y1="17" x2="44" y2="17" />
      <circle className="icon-pop" cx="9" cy="12.5" r="1.3" />
      <circle className="icon-pop" cx="14" cy="12.5" r="1.3" />
      <rect className="icon-pop" x="10" y="23" width="20" height="2.6" rx="1.3" />
      <rect className="icon-pop" x="10" y="29" width="14" height="2.6" rx="1.3" />
      <rect className="icon-pop icon-accent" x="10" y="35" width="9" height="2.6" rx="1.3" />
    </svg>
  )
}

export function MobileIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon" aria-hidden="true">
      <rect className="icon-draw" x="14" y="4" width="20" height="40" rx="5" />
      <line className="icon-draw" x1="21" y1="40" x2="27" y2="40" />
      <path className="icon-pop" d="M19 26q5-5 10 0" />
      <circle className="icon-pop icon-accent" cx="30" cy="11" r="2" />
    </svg>
  )
}

export function AiIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon path-icon--spin" aria-hidden="true">
      <path className="icon-pop" d="M24 4 27 20 44 24 27 28 24 44 21 28 4 24 21 20Z" />
      <circle className="icon-pop icon-accent" cx="24" cy="24" r="2" />
    </svg>
  )
}
