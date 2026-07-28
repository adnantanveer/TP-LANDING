import { useState } from 'react'
import { navLinks } from '../../data/nav'
import { Icon } from '../common/Icon'
import { Button } from '../common/Button'
import logo from '../../assets/techpotam-logo.png'
import './Footer.css'

const socials = [
  { name: 'LinkedIn', icon: 'linkedin-icon', href: 'https://www.linkedin.com/company/techpotam-private-limited/posts/' },
  { name: 'X / Twitter', icon: 'x-icon', href: 'https://x.com/techpotam' },
  { name: 'Instagram', icon: 'instagram-icon', href: 'https://www.instagram.com/techpotam/' },
  { name: 'Facebook', icon: 'facebook-icon', href: 'https://www.facebook.com/people/Techpotam/100064071823814/' },
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
          <Button href="mailto:Info@techpotam.com" variant="primary on-dark">
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
          <span className="footer__col-title">Our Office</span>
          <address>
            C1-301, Sector 16C
            <br />
            Noida, India 201318
            <br />
            <a href="tel:+917065946898">+91-7065946898</a>
            <br />
            <a href="mailto:Info@techpotam.com">Info@techpotam.com</a>
          </address>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Follow</span>
          <ul className="footer__socials">
            {socials.map((social) => (
              <li key={social.name}>
                <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.name}>
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>&copy; {new Date().getFullYear()} TechPotam. All rights reserved.</span>
        <img src={logo} alt="TechPotam" className="footer__wordmark" />
      </div>
    </footer>
  )
}
