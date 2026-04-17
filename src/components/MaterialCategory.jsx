import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const categories = [
  {
    label: 'Brick',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="14" height="8" rx="1.5" />
        <rect x="19" y="8" width="14" height="8" rx="1.5" />
        <rect x="10" y="20" width="14" height="8" rx="1.5" />
        <rect x="3" y="20" width="5" height="8" rx="1.5" />
        <rect x="26" y="20" width="7" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Wood Lumber',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="14" width="30" height="8" rx="2" />
        <line x1="9" y1="14" x2="9" y2="22" />
        <line x1="16" y1="14" x2="16" y2="22" />
        <line x1="23" y1="14" x2="23" y2="22" />
        <path d="M6 10l3 4M12 10l3 4M18 10l3 4M24 10l3 4" />
      </svg>
    ),
  },
  {
    label: 'Steel Rebar',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="32" y2="12" />
        <line x1="4" y1="18" x2="32" y2="18" />
        <line x1="4" y1="24" x2="32" y2="24" />
        <line x1="10" y1="8" x2="10" y2="28" />
        <line x1="18" y1="8" x2="18" y2="28" />
        <line x1="26" y1="8" x2="26" y2="28" />
      </svg>
    ),
  },
  {
    label: 'Drywall',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="28" height="24" rx="2" />
        <line x1="4" y1="14" x2="32" y2="14" />
        <line x1="4" y1="22" x2="32" y2="22" />
        <circle cx="18" cy="18" r="2" />
        <path d="M4 6l4-4h20l4 4" />
      </svg>
    ),
  },
  {
    label: 'Concrete Block',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="10" width="13" height="16" rx="2" />
        <rect x="20" y="10" width="13" height="16" rx="2" />
        <rect x="7" y="14" width="5" height="8" rx="1" />
        <rect x="24" y="14" width="5" height="8" rx="1" />
        <line x1="3" y1="26" x2="33" y2="26" />
      </svg>
    ),
  },
  {
    label: 'Paving Stone',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="12" height="12" rx="2" />
        <rect x="21" y="3" width="12" height="12" rx="2" />
        <rect x="3" y="21" width="12" height="12" rx="2" />
        <rect x="21" y="21" width="12" height="12" rx="2" />
      </svg>
    ),
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function MaterialCategory() {
  const [ref, inView] = useInView({ threshold: 0.15 })
  void motion

  return (
    <section className="category-section" id="categories">
      <div className="category-inner">
        <div className="category-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Browse by Type
          </motion.span>
          <motion.h2
            className="section-heading"
            style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Material Category
          </motion.h2>
          <motion.p
            className="section-sub"
            style={{ margin: '0 auto' }}
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            Find exactly what you need — or list what you have. Six core material
            categories covering all major construction surplus types.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          className="category-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {categories.map(({ label, icon }) => (
            <motion.div key={label} className="category-card" variants={cardVariants}>
              <div className="cat-icon-wrap">{icon}</div>
              <span className="cat-label">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
