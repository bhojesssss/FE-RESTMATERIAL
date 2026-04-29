import { motion } from 'framer-motion'

export default function StepCard({ num, title, desc, icon, variants }) {
  return (
    <motion.div className="how-card" variants={variants}>
      <div className="how-step-num">{num}</div>
      <div className="how-icon-wrap">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  )
}
