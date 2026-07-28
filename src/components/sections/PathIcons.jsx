export function WebIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon motion-icon" aria-hidden="true">
      <rect className="icon-draw" x="4" y="7" width="40" height="34" rx="4" />
      <line className="icon-draw" x1="4" y1="16" x2="44" y2="16" />
      <circle className="icon-pop" cx="9" cy="11.5" r="1.3" />
      <circle className="icon-pop" cx="14" cy="11.5" r="1.3" />
      <circle className="icon-pop" cx="19" cy="11.5" r="1.3" />
      <rect className="icon-pop icon-accent" x="10" y="21" width="28" height="9" rx="2" />
      <rect className="icon-pop" x="10" y="33" width="20" height="2.6" rx="1.3" />
      <rect className="icon-pop" x="10" y="38" width="13" height="2.6" rx="1.3" />
    </svg>
  )
}

export function MobileIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon motion-icon" aria-hidden="true">
      <rect className="icon-draw" x="13" y="4" width="22" height="40" rx="5" />
      <line className="icon-draw" x1="20" y1="40" x2="28" y2="40" />
      <rect className="icon-pop" x="17" y="10" width="14" height="9" rx="2" />
      <rect className="icon-pop icon-accent" x="17" y="21" width="14" height="9" rx="2" />
      <rect className="icon-pop" x="17" y="32" width="8" height="5" rx="1.5" />
    </svg>
  )
}

export function AiIcon() {
  return (
    <svg viewBox="0 0 48 48" className="path-icon motion-icon" aria-hidden="true">
      <path
        className="icon-draw"
        d="M6 10h36a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H20l-8 7v-7H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
      />
      <circle className="icon-pop icon-accent ai-dot" cx="16" cy="21" r="2.2" />
      <circle className="icon-pop icon-accent ai-dot" cx="24" cy="21" r="2.2" />
      <circle className="icon-pop icon-accent ai-dot" cx="32" cy="21" r="2.2" />
    </svg>
  )
}
