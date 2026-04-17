import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useInView } from '../hooks/useInView'

export default function CtaStrip() {
  const [ref, inView] = useInView({ threshold: 0.3 })
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
          <Link to="/create-listing" className="btn-hero btn-hero-primary">
            Start Selling Free
          </Link>
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
      </div>
    </section>
  )
}
