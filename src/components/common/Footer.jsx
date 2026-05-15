import { Link } from 'react-router-dom'
import { socials, footerCols } from '../../data/footerData.jsx'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/asset/white-icon-noBG.svg" alt="Logo" style={{ height: '36px', width: 'auto' }} />
              <div>REST<span>MATERIAL</span></div>
            </Link>
            <p className="footer-tagline">
              Indonesia's first specialized B2B marketplace for leftover
              construction materials. Connecting contractors, reducing waste,
              tracking carbon impact.
            </p>
            <div className="footer-socials">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="social-btn"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
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
        </div>
      </div>
    </footer>
  )
}
