import { motion } from 'framer-motion'

export default function SectionHeader({ tag, title, subtitle, inView = true }) {
  return (
    <>
      <motion.span
        className="section-tag"
        initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {tag}
      </motion.span>
      <motion.h2
        className="section-heading"
        style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className="section-sub"
          style={{ margin: '0 auto' }}
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          {subtitle}
        </motion.p>
      )}
    </>
  )
}
