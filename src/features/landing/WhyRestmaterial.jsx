import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { features, containerVariants, cardVariants } from '../../data/whyRestmaterialData'

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
