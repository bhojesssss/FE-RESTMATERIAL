import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { landingPreviewSteps } from '../../data/howItWorksGuideData'
import SectionHeader from '../../components/common/SectionHeader'
import { getCachedSession } from '../auth/auth'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

// Simple inline icons for each landing step
const stepIcons = {
  search: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  chat: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  order: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  sell: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
}

export default function HowItWorks() {
  const [ref, inView] = useInView({ threshold: 0.2 })
  const [session, setSession] = useState(() => getCachedSession())

  // Listen for auth changes so the section hides when user logs in
  useEffect(() => {
    function syncSession() {
      setSession(getCachedSession())
    }
    window.addEventListener('storage', syncSession)
    window.addEventListener('rm:auth:changed', syncSession)
    return () => {
      window.removeEventListener('storage', syncSession)
      window.removeEventListener('rm:auth:changed', syncSession)
    }
  }, [])

  // Hide for logged-in users
  if (session) return null

  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <div className="how-header">
          <SectionHeader
            tag="How It Works?"
            title={<>Cara Menggunakan<br />RestMaterial</>}
            subtitle="Beli atau jual material konstruksi sisa dengan mudah. Empat langkah sederhana untuk memulai."
            inView={inView}
          />
        </div>

        <motion.div
          ref={ref}
          className="how-cards"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
        >
          {landingPreviewSteps.map((step) => (
            <motion.div className="how-card" variants={cardVariants} key={step.num}>
              <div className="how-step-num">{step.num}</div>
              <div className="how-icon-wrap">{stepIcons[step.iconKey]}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="hiw-landing-cta-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to="/how-it-works" className="hiw-landing-cta">
            Panduan Lengkap
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
