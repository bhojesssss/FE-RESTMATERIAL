import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const steps = [
  {
    num: '01',
    title: 'Register Your Account',
    desc: 'Create a free account in minutes. No hidden fees — just your name, email, and company details.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="10" r="5" />
        <path d="M4 26c0-5 4-9 9-9" />
        <circle cx="24" cy="22" r="5" />
        <line x1="24" y1="19" x2="24" y2="25" />
        <line x1="21" y1="22" x2="27" y2="22" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Upload Your Material Remains',
    desc: 'List your leftover materials with photos, quantity, location, and preferred price. Done in under 3 minutes.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="20" height="24" rx="3" />
        <line x1="11" y1="10" x2="21" y2="10" />
        <line x1="11" y1="15" x2="21" y2="15" />
        <line x1="11" y1="20" x2="16" y2="20" />
        <polyline points="19,22 22,18 25,22" />
        <line x1="22" y1="18" x2="22" y2="26" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get a Deal',
    desc: 'Buyers browse and contact you directly. Negotiate, agree, and complete your transaction seamlessly.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18l4-4 5 3 6-7 5 5" />
        <path d="M20 14c1.5-1.5 5-1 6 1l-8 8-4-2-6 3" />
        <path d="M2 22l4-2" />
        <path d="M10 28l2-4" />
      </svg>
    ),
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

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
