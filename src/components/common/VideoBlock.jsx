import { useEffect, useRef, useState } from 'react'
import './VideoBlock.css'

/**
 * Reusable video slot used throughout the site (Craft background, project
 * previews, team reels, testimonials, final CTA). Pass a real `src` when
 * footage is available. Until then, pass `image` for a sample placeholder
 * photo (currently Lorem Picsum stock images, seeded per usage for
 * stability) with the same grain treatment, or omit both for the plain
 * animated gradient. Swapping in real video later is a one-line change at
 * the call site.
 */
export function VideoBlock({ src, poster, image, label, tone = 'dark', className = '' }) {
  const wrapperRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return
    if (inView) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [inView, src])

  return (
    <div ref={wrapperRef} className={`video-block video-block--${tone} ${className}`.trim()}>
      {src ? (
        <video
          ref={videoRef}
          className="video-block__media"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={src} />
        </video>
      ) : (
        <div className={`video-block__placeholder ${inView ? 'is-active' : ''}`} aria-hidden="true">
          {image ? (
            <img className="video-block__image" src={image} loading="lazy" decoding="async" alt="" />
          ) : null}
          <span className="video-block__grain" />
        </div>
      )}
      {label ? <span className="u-visually-hidden">{label}</span> : null}
    </div>
  )
}
