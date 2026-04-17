import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import MaterialCategory from '../components/MaterialCategory'
import WhyRestmaterial from '../components/WhyRestmaterial'
import CtaStrip from '../components/CtaStrip'

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <MaterialCategory />
      <WhyRestmaterial />
      <CtaStrip />
    </main>
  )
}

