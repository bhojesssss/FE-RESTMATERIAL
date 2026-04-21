import { motion } from 'framer-motion'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function AboutPage() {
  void motion

  return (
    <motion.main className="about-shell" {...pageMotion}>
      <div className="about-inner">
        <header className="about-head">
          <span className="section-tag">About Us</span>
          <h1 className="about-title">The RESTMATERIAL story</h1>
          <p className="about-lead">
            RESTMATERIAL exists because construction does not have to mean waste. We are a B2B marketplace built for
            Indonesia's builders — where surplus bricks, steel, wood, and finishes find a second life instead of a landfill.
          </p>
        </header>

        <div className="about-blocks">
          <section className="about-block">
            <h2>Why we started</h2>
            <p>
              Every project ends with leftovers: over-ordered rebar, unused tiles, doors that never made it to site. Those
              materials still have value — for another contractor, another city, another timeline. Generic marketplaces were
              never designed for how construction teams buy, sell, or verify surplus. RESTMATERIAL is.
            </p>
          </section>
          <section className="about-block">
            <h2>What we believe</h2>
            <p>
              Reuse should be simple, transparent, and free at the point of exchange. We believe listings should speak the
              language of sites and warehouses: volume, condition, location, and trust — not buzzwords. And we believe
              every completed deal should carry a story of impact, including the carbon emissions avoided when new production
              is not needed.
            </p>
          </section>
          <section className="about-block">
            <h2>Where we are going</h2>
            <p>
              Our roadmap is tied to real yards and real projects: broader coverage across cities, smarter filters for
              material types, and tools that help teams close deals with confidence. RESTMATERIAL is for everyone who refuses
              to let good materials go to waste — one listing, one handshake, one reuse at a time.
            </p>
          </section>
          <section className="about-block">
            <h2>Our Methodology</h2>
            <p>
              Kalkulasi penghematan CO2 kami didasarkan pada berat material yang di-reuse dikalikan dengan faktor emisi produksi material baru. Sumber data faktor emisi merujuk pada ICE Database v3.0 (University of Bath) dan CIDB Malaysia Embodied Carbon Inventory.
            </p>
          </section>
        </div>
      </div>
    </motion.main>
  )
}
