export function Icon({ name, sprite = '/icons.svg', size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`${sprite}#${name}`} />
    </svg>
  )
}
