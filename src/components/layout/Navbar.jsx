import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { navLinks } from '../../data/nav'
import logo from '../../assets/techpotam-logo.png'
import './Navbar.css'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('')
  const firstLinkRef = useRef(null)

  useEffect(() => {
    const sections = navLinks.map((link) => document.querySelector(link.href)).filter(Boolean)
    if (!sections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      gsap.fromTo(
        gsap.utils.toArray('.mobile-menu__link'),
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, delay: 0.15, ease: 'power3.out' }
      )
      firstLinkRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <a href="#top" className="navbar__logo">
          <img src={logo} alt="TechPotam" className="navbar__logo-img" />
        </a>

        <nav className="navbar__links" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.href === activeHref ? 'is-active' : ''}
              aria-current={link.href === activeHref ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="navbar__cta">
          Book a Call
        </a>

        <button
          type="button"
          className={`navbar__burger ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  className="mobile-menu__link"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="mobile-menu__link mobile-menu__link--cta"
                onClick={() => setOpen(false)}
              >
                Book a Call
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
