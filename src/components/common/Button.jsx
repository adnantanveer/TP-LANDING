import { useRef } from 'react'
import './Button.css'

export function Button({
  href,
  variant = 'primary',
  children,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  const ref = useRef(null)

  const spawnRipple = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.7
    const ripple = document.createElement('span')
    ripple.className = 'btn__ripple'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`
    el.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }

  const variantClasses = variant
    .split(' ')
    .filter(Boolean)
    .map((v) => `btn--${v}`)
    .join(' ')

  const sharedProps = {
    ref,
    className: `btn ${variantClasses} ${className}`.trim(),
    onPointerDown: spawnRipple,
    onClick,
    ...rest,
  }

  if (href) {
    return (
      <a href={href} {...sharedProps}>
        <span className="btn__label">{children}</span>
      </a>
    )
  }

  return (
    <button type={type} {...sharedProps}>
      <span className="btn__label">{children}</span>
    </button>
  )
}
