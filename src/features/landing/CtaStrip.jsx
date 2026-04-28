import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { getCachedSession, updateUser } from '../auth/auth'
import RoleUpgradeModal from '../../components/shared/RoleUpgradeModal'

export default function CtaStrip() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  // FIX: session tidak pernah dideklarasikan sebelumnya — ini yang bikin crash
  const [session, setSession] = useState(() => getCachedSession())

  const handleSellClick = (e) => {
    e.preventDefault()
    if (!session) {
      navigate('/login')
      return
    }
    if (session.role === 'BUYER') {
      setShowModal(true)
    } else {
      navigate('/create-listing')
    }
  }

  const confirmUpgrade = async () => {
    try {
      const nextSession = await updateUser(session.userId, { role: 'BOTH' })
      setSession(nextSession) // FIX: update state supaya role langsung reflect
      setShowModal(false)
      navigate('/create-listing')
    } catch (err) {
      alert('Gagal mengupgrade akun: ' + err.message)
    }
  }

  void motion

  return (
    <section className="cta-strip" ref={ref}>
      <div className="cta-inner">
        <motion.div
          className="cta-text"
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>Ready to Turn Surplus Into Revenue?</h2>
          <p>Join thousands of contractors and developers already listing on RESTMATERIAL.</p>
        </motion.div>
        <motion.div
          className="cta-actions"
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="/create-listing" onClick={handleSellClick} className="btn-hero btn-hero-primary">
            Start Selling Free
          </a>
          <Link
            to="/marketplace"
            className="btn-hero"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            Browse Listings
          </Link>
        </motion.div>

        <RoleUpgradeModal
          isOpen={showModal}
          onConfirm={confirmUpgrade}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </section>
  )
}