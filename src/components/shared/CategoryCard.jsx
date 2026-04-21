import { motion } from 'framer-motion'

export default function CategoryCard({ label, icon, variants }) {
  return (
    <motion.div className="category-card" variants={variants}>
      <div className="cat-icon-wrap">{icon}</div>
      <span className="cat-label">{label}</span>
    </motion.div>
  )
}
