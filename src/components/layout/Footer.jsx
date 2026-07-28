import { useState } from 'react'
import { navLinks } from '../../data/nav'
import { Icon } from '../common/Icon'
import { Button } from '../common/Button'
import './Footer.css'

const socials = [
  { name: 'LinkedIn', icon: 'linkedin-icon', href: '[Your LinkedIn URL]' },
  { name: 'X / Twitter', icon: 'x-icon', href: '[Your X/Twitter URL]' },
  { name: 'Instagram', icon: 'instagram-icon', href: '[Your Instagram URL]' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <footer id="contact" className="footer">
      <div className="container footer__top">
        <div className="footer__intro">
          <p className="eyebrow">Let&rsquo;s talk</p>
          <h2 className="footer__heading">
            Have a project in mind? <br /> We&rsquo;d love to hear about it.
          </h2>
          <Button href="mailto:[Your Contact Email]" variant="primary on-dark">
            Start Your Project
          </Button>
        </div>

        <form className="footer__newsletter" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email">Join the studio newsletter</label>
          <div className="footer__newsletter-row">
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" aria-label="Subscribe">
              <Icon name="arrow-right-icon" />
            </button>
          </div>
          <p className="footer__newsletter-status" role="status">
            {submitted ? 'Thanks — you’re on the list.' : ''}
          </p>
        </form>
      </div>

      <div className="container footer__grid">
        <div className="footer__col">
          <span className="footer__col-title">Quick Links</span>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">UK Office</span>
          <address>
            [Your UK Office Address]
            <br />
            [Your City], [Your Postcode]
            <br />
            <a href="tel:[Your Phone Number]">[Your Phone Number]</a>
            <br />
            <a href="mailto:[Your Contact Email]">[Your Contact Email]</a>
          </address>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Follow</span>
          <ul className="footer__socials">
            {socials.map((social) => (
              <li key={social.name}>
                <a href={social.href} aria-label={social.name}>
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>&copy; {new Date().getFullYear()} TechPotam. All rights reserved.</span>
        <span className="footer__wordmark">techpotam.</span>
      </div>
    </footer>
  )
}
