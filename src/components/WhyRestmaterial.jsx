import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const features = [
  {
    title: 'Specialized in Construction Materials',
    desc: 'Unlike generic marketplaces, every feature is purpose-built for the construction industry — from listing formats to search filters.',
    badge: 'Industry Focused',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Filter by City & Material Type',
    desc: 'Find exactly what you need with granular location and category filters — covering 340+ cities across Indonesia.',
    badge: 'Smart Search',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    title: 'Automated Carbon Tracking Per Transaction',
    desc: 'Every completed deal automatically calculates the carbon emissions saved by reusing materials instead of producing new ones.',
    badge: 'Eco Impact',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 4-2.5 7.5-6 9.5" />
        <path d="M12 22C6.5 22 2 17.5 2 12" />
        <path d="M8 12l3 3 5-6" />
        <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" />
      </svg>
    ),
  },
  {
    title: 'Free for All Users',
    desc: 'Zero listing fees. Zero commissions. Full access to all marketplace features at no cost — always. Sustainability shouldn\'t have a price tag.',
    badge: 'Always Free',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
      </svg>
    ),
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function WhyRestmaterial() {
  const [ref, inView] = useInView({ threshold: 0.15 })
  void motion

  return (
    <section className="why-section" id="why">
      <div className="why-inner">
        <div className="why-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Our Advantage
          </motion.span>
          <motion.h2
            className="section-heading"
            style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Why RESTMATERIAL?
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            Built from the ground up for construction professionals who refuse to let
            valuable materials go to waste.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          className="why-cards"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {features.map(({ title, desc, badge, icon }) => (
            <motion.div key={title} className="why-card" variants={cardVariants}>
              <div className="why-icon-wrap">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="why-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <circle cx="5" cy="5" r="5" />
                </svg>
                {badge}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
