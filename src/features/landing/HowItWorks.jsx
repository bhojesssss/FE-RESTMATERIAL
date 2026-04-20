import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { steps, containerVariants, cardVariants } from '../../data/howItWorksData'

export default function HowItWorks() {
  const [ref, inView] = useInView({ threshold: 0.2 })
  void motion

  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <div className="how-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            How It Works?
          </motion.span>
          <motion.h2
            className="section-heading"
            style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            A Platform to Sell<br />Material Remains
          </motion.h2>
          <motion.p
            className="section-sub"
            style={{ margin: '0 auto' }}
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            Your Project Material Remains Still Have Value. Three simple steps to turn
            leftover materials into profit.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          className="how-cards"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {steps.map((step) => (
            <motion.div key={step.num} className="how-card" variants={cardVariants}>
              <div className="how-step-num">{step.num}</div>
              <div className="how-icon-wrap">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
