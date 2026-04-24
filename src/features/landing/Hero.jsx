import { motion } from 'framer-motion'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { getImpactStats } from './ImpactLogic'
import { getSession } from '../auth/auth'

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  const bgRef = useRef(null)
  const [stats, setStats] = useState({ activeListings: 2400, divertedKg: 12450, co2Kg: 8200, users: 1120 })

  useEffect(() => {
    setStats(getImpactStats())
  }, [])

  void motion

  // Subtle parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return
      const offset = window.scrollY
      bgRef.current.style.transform = `translateY(${offset * 0.25}px) scale(1.06)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToNext = useCallback(() => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section className="hero" id="hero">
      {/* Background Image */}
      <div
        ref={bgRef}
        className="hero-bg"
        style={{ transform: 'scale(1.06)' }}
        aria-hidden="true"
      />
      {/* Overlay Gradient */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-text-block">
          <motion.span
            className="hero-eyebrow"
            variants={fadeUp} initial="hidden" animate="show" custom={0}
          >
            B2B Construction Material Exchange
          </motion.span>

          <motion.h1
            className="hero-heading"
            variants={fadeUp} initial="hidden" animate="show" custom={1}
          >
            Solution For<br />Material Remains
          </motion.h1>

          <motion.p
            className="hero-sub"
            variants={fadeUp} initial="hidden" animate="show" custom={2}
          >
            Your project materials still have value. Connect, list, and trade
            leftover construction materials — reducing waste and maximizing returns.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            variants={fadeUp} initial="hidden" animate="show" custom={3}
          >
            <Link to={getSession() ? "/create-listing" : "/login"} className="btn-hero btn-hero-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Sell Material
            </Link>
            <Link to="/marketplace" className="btn-hero btn-hero-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Find Material
            </Link>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          className="hero-stats-row"
          variants={fadeUp} initial="hidden" animate="show" custom={4}
        >
          {[
            { num: `${stats.divertedKg.toLocaleString()} kg`, label: 'Total Material Diverted' },
            { num: `${stats.co2Kg.toLocaleString()} kg`, label: 'CO2 Saved' },
            { num: `${stats.activeListings.toLocaleString()}+`, label: 'Active Listings' },
            { num: `${stats.users.toLocaleString()}+`, label: 'Registered Users' },
          ].map(({ num, label }) => (
            <div key={label} className="hero-stat-item">
              <div className="hero-stat-num">{num}</div>
              <div className="hero-stat-label">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <button type="button" className="scroll-indicator" onClick={scrollToNext} aria-label="Scroll to next section">
        <div className="scroll-line" aria-hidden="true" />
        <span>Scroll</span>
      </button>
    </section>
  )
}
