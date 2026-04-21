import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { features, containerVariants, cardVariants } from '../../data/whyRestmaterialData'
import FeatureCard from '../../components/shared/FeatureCard'
import SectionHeader from '../../components/common/SectionHeader'

export default function WhyRestmaterial() {
  const [ref, inView] = useInView({ threshold: 0.15 })
  void motion

  return (
    <section className="why-section" id="why">
      <div className="why-inner">
        <div className="why-header">
          <SectionHeader
            tag="Our Advantage"
            title="Why RESTMATERIAL?"
            subtitle="Built from the ground up for construction professionals who refuse to let valuable materials go to waste."
            inView={inView}
          />
        </div>

        <motion.div
          ref={ref}
          className="why-cards"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {features.map(({ title, desc, badge, icon }) => (
            <FeatureCard
              key={title}
              title={title}
              desc={desc}
              badge={badge}
              icon={icon}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
