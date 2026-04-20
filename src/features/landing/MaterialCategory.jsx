import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { categories, containerVariants, cardVariants } from '../../data/materialCategoryData'

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
