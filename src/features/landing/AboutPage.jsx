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
            RESTMATERIAL is Indonesia’s first specialized B2B exchange for construction surplus. We exist because construction does not have to mean waste.
          </p>
        </header>

        <div className="about-blocks">
          <section className="about-block">
            <h2>The Waste Problem</h2>
            <p>
              Construction debris accounts for nearly 40% of global solid waste. In Indonesia, the challenge is growing rapidly alongside massive urban development. Millions of tons of reusable steel, bricks, and timber end up in landfills every year, squandering their embodied value and increasing the environmental footprint of our cities.
            </p>
          </section>

          <section className="about-block">
            <h2>The Solution</h2>
            <p>
              We bridge the gap between projects with surplus and those in need. By creating a direct exchange platform, we ensure that leftover materials find a second life instead of a landfill. Every transaction on RESTMATERIAL not only saves costs but actively tracks every kilogram of CO2 saved, promoting a measurable sustainable future.
            </p>
          </section>

          <section className="about-block">
            <h2>Our Values</h2>
            <div className="about-values-grid">
              <div className="val-card">
                <div className="val-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 12A9.5 9.5 0 1 1 12 2.5a9.5 9.5 0 0 1 9.5 9.5z"/><path d="M12 2.5v9.5l7 7"/></svg>
                </div>
                <h3>Circular Economy</h3>
                <p>Extending the lifecycle of materials.</p>
              </div>
              <div className="val-card">
                <div className="val-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h3>Transparency</h3>
                <p>Clear data on listings, conditions, and sellers.</p>
              </div>
              <div className="val-card">
                <div className="val-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3>Environment Impact</h3>
                <p>Measurable carbon emission reductions.</p>
              </div>
            </div>
          </section>

          <section className="about-block about-block--methodology">
            <h2>Our Methodology</h2>
            <p>
              Our CO2 savings calculation is primarily based on the concept of <strong>Embodied Carbon</strong> — the total greenhouse gas emissions generated during the manufacturing, transportation, and construction phases of a material. By reusing materials, we directly avoid the need to produce new ones, effectively saving the equivalent embodied carbon from being released.
            </p>
            <p style={{ marginTop: '1rem' }}>
              The emission factors we use are derived from standardized global and regional databases, specifically referencing the <strong>Inventory of Carbon and Energy (ICE) Database v3.0 (University of Bath)</strong> and the <strong>CIDB Malaysia Embodied Carbon Inventory</strong>.
            </p>
            <table className="factor-table">
              <thead>
                <tr>
                  <th>Material Category</th>
                  <th>Embodied Carbon (kg CO2e / kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Steel &amp; Iron</td>
                  <td>1.46</td>
                </tr>
                <tr>
                  <td>Aluminium</td>
                  <td>8.24</td>
                </tr>
                <tr>
                  <td>Ceramic &amp; Granite</td>
                  <td>0.78</td>
                </tr>
                <tr>
                  <td>Bricks &amp; Blocks</td>
                  <td>0.24</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </motion.main>
  )
}
