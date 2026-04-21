import { motion } from 'framer-motion'

export default function FeatureCard({ title, desc, badge, icon, variants }) {
  return (
    <motion.div className="why-card" variants={variants}>
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
  )
}
