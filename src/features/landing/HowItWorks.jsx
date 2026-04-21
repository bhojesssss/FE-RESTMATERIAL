import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { steps, containerVariants, cardVariants } from '../../data/howItWorksData'
import StepCard from '../../components/shared/StepCard'
import SectionHeader from '../../components/common/SectionHeader'

export default function HowItWorks() {
  const [ref, inView] = useInView({ threshold: 0.2 })
  void motion

  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <div className="how-header">
          <SectionHeader
            tag="How It Works?"
            title={<>A Platform to Sell<br />Material Remains</>}
            subtitle="Your Project Material Remains Still Have Value. Three simple steps to turn leftover materials into profit."
            inView={inView}
          />
        </div>

        <motion.div
          ref={ref}
          className="how-cards"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {steps.map((step) => (
            <StepCard
              key={step.num}
              num={step.num}
              title={step.title}
              desc={step.desc}
              icon={step.icon}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
