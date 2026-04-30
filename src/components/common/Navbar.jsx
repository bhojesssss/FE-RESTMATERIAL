import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getCachedSession } from '../../features/auth/auth'
import logo from '../../../asset/white-icon-noBG.svg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState(() => getCachedSession())

  useEffect(() => {
    function syncSession() {
      setSession(getCachedSession())
    }

    // 'storage' event fire saat localStorage berubah — termasuk dari LoginPage
    window.addEventListener('storage', syncSession)

    // Custom event untuk same-tab updates (storage event tidak fire di tab yang sama)
    window.addEventListener('rm:auth:changed', syncSession)

    return () => {
      window.removeEventListener('storage', syncSession)
      window.removeEventListener('rm:auth:changed', syncSession)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/" className="nav-logo" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }} aria-label="Go to landing page">
        <img src={logo} alt="Logo" style={{ height: '36px', width: 'auto' }} />
        <div>REST<span>MATERIAL</span></div>
      </Link>

      <ul className="nav-links" style={{ marginRight: '2rem' }}>
        <li><Link to="/marketplace">Marketplace</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>

      <div className="nav-links" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {session ? (
          <Link to="/profile" className="nav-profile-icon" aria-label="Profile" title="Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn-nav btn-nav-outline">Login</Link>
            <Link to="/register" className="btn-nav btn-nav-solid">Register</Link>
          </>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        className="mobile-menu-btn"
      >
        {menuOpen ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="18" y2="18" />
            <line x1="18" y1="4" x2="4" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="19" y2="6" />
            <line x1="3" y1="11" x2="19" y2="11" />
            <line x1="3" y1="16" x2="19" y2="16" />
          </svg>
        )}
      </button>

      <button
        className={`mobile-menu-overlay${menuOpen ? ' mobile-menu-overlay--visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-label="Close menu"
        tabIndex={-1}
      />

      <div
        className={`mobile-menu-panel${menuOpen ? ' mobile-menu-panel--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-menu-nav">
          <Link to="/marketplace" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
            Marketplace
          </Link>
          <Link to="/about" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <div className="mobile-menu-divider" />
          {session ? (
            <Link to="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              My Profile
            </Link>
          ) : (
            <div className="mobile-menu-auth">
              <Link to="/login" className="mobile-menu-btn-link mobile-menu-btn-outline" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-menu-btn-link mobile-menu-btn-solid" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.nav>
  )
}