import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getImpactStats } from './ImpactLogic'

export default function ImpactSection() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    setStats(getImpactStats())
  }, [])

  if (!stats) return null

  // Emerland, Bus Yellow, Prussian, Oxford, Slate, Secondary Yellow
  const colors = ['#059669', '#FFC300', '#003566', '#001D3D', '#94a3b8', '#F59E0B']

  return (
    <section className="impact-section" style={{ padding: '6rem 6%', background: 'linear-gradient(180deg, var(--white), var(--cream))' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-tag" style={{ margin: '0 auto', display: 'inline-block' }}>Public Impact Dashboard</span>
          <h2 className="section-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--oxford)', marginTop: '1rem', marginBottom: '0.75rem' }}>
            Real-time Environmental Impact
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
            Real-time impact projection based on ICE Database v3.0
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem', border: '1px solid rgba(0, 53, 102, 0.06)', boxShadow: '0 12px 40px rgba(0,29,61,0.06)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--prussian)', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CO₂ Saved Breakdown by Category
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {stats.breakdown.slice(0, 6).map((item, index) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem', color: 'var(--prussian)' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{item.category}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                    <span style={{ color: 'var(--prussian)', fontSize: '1rem' }}>{Math.round(item.value).toLocaleString()}</span> kg ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '14px', background: 'rgba(0,53,102,0.04)', borderRadius: '8px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.2, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: colors[index % colors.length], borderRadius: '8px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
