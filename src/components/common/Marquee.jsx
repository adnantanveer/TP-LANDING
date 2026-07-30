import './Marquee.css'

/**
 * Infinite horizontal scrolling text ribbon. The track is duplicated so the
 * CSS keyframe can loop seamlessly at -50%; `prefers-reduced-motion` freezes
 * it via the stylesheet (no JS branch needed).
 */
export function Marquee({ items, tone = 'dark', speed = 28, className = '' }) {
  return (
    <div className={`marquee marquee--${tone} ${className}`.trim()} aria-hidden="true">
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((rep) => (
          <div className="marquee__group" key={rep}>
            {items.map((item, i) => (
              <span className="marquee__item" key={`${rep}-${i}`}>
                {item}
                <span className="marquee__dot">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
