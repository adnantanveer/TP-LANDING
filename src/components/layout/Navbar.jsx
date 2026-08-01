import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { navLinks } from '../../data/nav'
import { socials } from '../../data/socials'
import { Icon } from '../common/Icon'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import logo from '../../assets/techpotam-logo.png'
import './Navbar.css'

function londonTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState('')
  const [time, setTime] = useState(londonTime)
  const firstLinkRef = useRef(null)
  const simplified = useSimplifiedMotion()

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
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''

    if (open) {
      firstLinkRef.current?.focus()
      setTime(londonTime())
      const tick = window.setInterval(() => setTime(londonTime()), 30000)

      const links = gsap.utils.toArray('.site-menu__link')
      const aside = gsap.utils.toArray('.site-menu__block')
      if (simplified) {
        gsap.set([links, aside], { clearProps: 'all' })
      } else {
        gsap.fromTo(
          links,
          { yPercent: 110, rotate: 4 },
          { yPercent: 0, rotate: 0, duration: 0.85, stagger: 0.07, delay: 0.2, ease: 'expo.out' }
        )
        gsap.fromTo(
          aside,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.5, ease: 'power2.out' }
        )
      }

      return () => {
        window.clearInterval(tick)
        document.body.style.overflow = ''
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open, simplified])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a href="#top" className="navbar__logo">
          <img src={logo} alt="TechPotam" className="navbar__logo-img" />
        </a>

        <button
          type="button"
          className={`navbar__trigger ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="navbar__trigger-label">
            <span className="navbar__trigger-word navbar__trigger-word--menu">Menu</span>
            <span className="navbar__trigger-word navbar__trigger-word--close">Close</span>
          </span>
          <span className="navbar__trigger-icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div id="site-menu" className={`site-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <span className="site-menu__backdrop-word" aria-hidden="true">TechPotam</span>

        <div className="site-menu__inner container">
          <nav className="site-menu__nav" aria-label="Primary">
            <ul>
              {navLinks.map((link, i) => (
                <li key={link.href} className="site-menu__item">
                  <a
                    href={link.href}
                    ref={i === 0 ? firstLinkRef : undefined}
                    className={`site-menu__link ${link.href === activeHref ? 'is-active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="site-menu__link-index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="site-menu__link-label">{link.label}</span>
                    <Icon name="arrow-right-icon" className="site-menu__link-arrow" />
                  </a>
                </li>
              ))}
              <li className="site-menu__item">
                <a
                  href="#contact"
                  className="site-menu__link site-menu__link--cta"
                  onClick={() => setOpen(false)}
                >
                  <span className="site-menu__link-index">{String(navLinks.length + 1).padStart(2, '0')}</span>
                  <span className="site-menu__link-label">Book a Call</span>
                  <Icon name="arrow-right-icon" className="site-menu__link-arrow" />
                </a>
              </li>
            </ul>
          </nav>

          <div className="site-menu__aside">
            <div className="site-menu__block">
              <span className="site-menu__block-title">Get in touch</span>
              <a href="mailto:Info@techpotam.com">Info@techpotam.com</a>
              <a href="tel:+917065946898">+91-7065946898</a>
            </div>

            <div className="site-menu__block">
              <span className="site-menu__block-title">Follow</span>
              <ul className="site-menu__socials">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.name}>
                      <Icon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-menu__block site-menu__clock">
              <span className="site-menu__block-title">Studio time — London</span>
              <span className="site-menu__clock-value">{time}</span>
            </div>
          </div>
        </div>
    </div>
    </header>
  )
}
