import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { categories, containerVariants, cardVariants } from '../../data/materialCategoryData'
import CategoryCard from '../../components/shared/CategoryCard'
import SectionHeader from '../../components/common/SectionHeader'

export default function MaterialCategory() {
  const [ref, inView] = useInView({ threshold: 0.15 })
  void motion

  return (
    <section className="category-section" id="categories">
      <div className="category-inner">
        <div className="category-header">
          <SectionHeader
            tag="Browse by Type"
            title="Material Category"
            subtitle="Find exactly what you need — or list what you have. Six core material categories covering all major construction surplus types."
            inView={inView}
          />
        </div>

        <motion.div
          ref={ref}
          className="category-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {categories.map(({ label, icon }) => (
            <CategoryCard key={label} label={label} icon={icon} variants={cardVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
