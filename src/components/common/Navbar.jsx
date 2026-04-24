import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getSession } from '../../features/auth/auth'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const session = getSession()

  void motion

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/" className="nav-logo" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }} aria-label="Go to landing page">
        <img src="/asset/white-icon-noBG.svg" alt="Logo" style={{ height: '36px', width: 'auto' }} />
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
        aria-label="Toggle menu"
        className="mobile-menu-btn"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </svg>
      </button>
    </motion.nav>
  )
}
