import { useRef } from 'react'
import { useSplitReveal } from '../../hooks/useSplitReveal'

export function SplitHeading({
  as: Tag = 'h2',
  className = '',
  children,
  immediate = false,
  play = true,
  delay = 0,
  ...rest
}) {
  const ref = useRef(null)
  useSplitReveal(ref, { immediate, play, delay })

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
