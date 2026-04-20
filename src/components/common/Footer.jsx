import { Link } from 'react-router-dom'
import { socials, footerCols } from '../../data/footerData.jsx'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              REST<span>MATERIAL</span>
            </Link>
            <p className="footer-tagline">
              Indonesia's first specialized B2B marketplace for leftover
              construction materials. Connecting contractors, reducing waste,
              tracking carbon impact.
            </p>
            <div className="footer-socials">
              {socials.map(({ label, href, icon }) => (
                <a key={label} href={href} className="social-btn" aria-label={label}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {footerCols.map(({ heading, links }) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-copy">
            &copy; {new Date().getFullYear()} RESTMATERIAL. All rights reserved.
          </span>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
