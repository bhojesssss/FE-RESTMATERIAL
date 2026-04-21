import { motion } from 'framer-motion'

export default function MetricCard({ label, value, hint, highlight, variants }) {
  return (
    <motion.div className={`profile-metric ${highlight ? 'profile-metric--accent' : ''}`} variants={variants}>
      <div className="profile-metric-top">
        <span className="profile-metric-label">{label}</span>
        <span className="profile-metric-arrow" aria-hidden>↗</span>
      </div>
      <div className="profile-metric-value">{value}</div>
      <div className="profile-metric-hint">{hint}</div>
    </motion.div>
  )
}
