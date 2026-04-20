import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CITIES, CONDITIONS, LISTINGS, MATERIAL_CATEGORIES } from '../../data/marketplace'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `IDR ${n}`
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export default function MarketplacePage() {
  void motion

  const [selectedCities, setSelectedCities] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedConditions, setSelectedConditions] = useState([])
  const [status, setStatus] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(10_000_000)

  const filtered = useMemo(() => {
    let items = [...LISTINGS]

    if (selectedCities.length) items = items.filter((l) => selectedCities.includes(l.city))
    if (selectedCategories.length) items = items.filter((l) => selectedCategories.includes(l.category))
    if (selectedConditions.length) items = items.filter((l) => selectedConditions.includes(l.condition))
    if (status !== 'All') items = items.filter((l) => (status === 'Available' ? l.status === 'Available' : l.status === 'Sold Out'))

    items = items.filter((l) => l.priceIdr >= priceMin && l.priceIdr <= priceMax)

    if (sortBy === 'Newest') items.sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))
    if (sortBy === 'Lowest Price') items.sort((a, b) => a.priceIdr - b.priceIdr)
    if (sortBy === 'Highest Volume') items.sort((a, b) => (b.volume?.value || 0) - (a.volume?.value || 0))

    return items
  }, [priceMax, priceMin, selectedCategories, selectedCities, selectedConditions, sortBy, status])

  function toggleInList(value, list, setList) {
    setList((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]))
  }

  function resetFilters() {
    setSelectedCities([])
    setSelectedCategories([])
    setSelectedConditions([])
    setStatus('All')
    setSortBy('Newest')
    setPriceMin(0)
    setPriceMax(10_000_000)
  }

  return (
    <motion.main className="market-shell" {...pageMotion}>
      <div className="market-inner">
        <header className="market-head">
          <div>
            <span className="section-tag">Marketplace</span>
            <h1 className="market-title">Browse Materials</h1>
            <p className="market-sub">Filter by city, type, condition, and price — then view details to contact the seller.</p>
          </div>

          <div className="market-head-right">
            <div className="market-sort">
              <label className="market-label" htmlFor="sort">Sort By</label>
              <select id="sort" className="market-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Newest</option>
                <option>Lowest Price</option>
                <option>Highest Volume</option>
              </select>
            </div>
          </div>
        </header>

        <div className="market-layout">
          {/* Left Sidebar */}
          <aside className="filter-card">
            <div className="filter-head">
              <div className="filter-title">Filters</div>
              <button type="button" className="filter-reset-link" onClick={resetFilters}>Reset</button>
            </div>

            <div className="filter-section">
              <div className="filter-label">City</div>
              <div className="filter-options">
                {CITIES.map((c) => (
                  <label key={c} className="check">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(c)}
                      onChange={() => toggleInList(c, selectedCities, setSelectedCities)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Material Type</div>
              <div className="filter-options">
                {MATERIAL_CATEGORIES.map((cat) => (
                  <label key={cat} className="check">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleInList(cat, selectedCategories, setSelectedCategories)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Condition</div>
              <div className="filter-options">
                {CONDITIONS.map((cond) => (
                  <label key={cond} className="check">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(cond)}
                      onChange={() => toggleInList(cond, selectedConditions, setSelectedConditions)}
                    />
                    <span>{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Price Range</div>
              <div className="range-readout">
                <span>{formatIdr(priceMin)}</span>
                <span>{formatIdr(priceMax)}</span>
              </div>

              <div className="range-wrap">
                <input
                  className="range"
                  type="range"
                  min={0}
                  max={10_000_000}
                  step={50_000}
                  value={priceMin}
                  onChange={(e) => {
                    const v = clamp(Number(e.target.value), 0, priceMax)
                    setPriceMin(v)
                  }}
                />
                <input
                  className="range"
                  type="range"
                  min={0}
                  max={10_000_000}
                  step={50_000}
                  value={priceMax}
                  onChange={(e) => {
                    const v = clamp(Number(e.target.value), priceMin, 10_000_000)
                    setPriceMax(v)
                  }}
                />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Status</div>
              <div className="filter-options">
                {['All', 'Available', 'Sold Out'].map((s) => (
                  <label key={s} className="radio">
                    <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className="filter-reset-btn" onClick={resetFilters}>Reset Filter</button>
          </aside>

          {/* Right Grid */}
          <section className="listing-wrap">
            {filtered.length ? (
              <motion.div className="listing-grid" variants={gridVariants} initial="hidden" animate="show">
                {filtered.map((l) => (
                  <motion.article key={l.id} className="listing-card" variants={cardVariants}>
                    <div className="thumb">
                      <div className={`status-badge ${l.status === 'Available' ? 'status-ok' : 'status-sold'}`}>
                        {l.status === 'Available' ? 'Available' : 'Sold'}
                      </div>
                      {l.images?.[0] ? <img src={l.images[0]} alt={l.name} /> : (
                        <div className="thumb-ph" aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <path d="M8 13l2.5 2.5L16 10" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="card-body">
                      <div className="cat-badge">{l.category}</div>
                      <div className="card-title" title={l.name}>{l.name}</div>
                      <div className="card-meta">
                        {l.city} • {l.volume?.value} {l.volume?.unit}
                      </div>

                      <div className="card-row">
                        <span className={`cond-pill ${l.condition.startsWith('New') ? 'cond-new' : l.condition.startsWith('Pre-loved') ? 'cond-pre' : 'cond-repair'}`}>
                          {l.condition.startsWith('New') ? 'New' : l.condition.startsWith('Pre-loved') ? 'Pre-loved' : 'Needs Repair'}
                        </span>
                        <div className="card-price">{formatIdr(l.priceIdr)}</div>
                      </div>

                      <Link className="card-cta" to={`/marketplace/${l.id}`}>View Details</Link>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <div className="empty">
                <div className="empty-ill" aria-hidden="true">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <div className="empty-title">No matching materials found</div>
                <div className="empty-sub">Try changing filters or reset to the default view.</div>
                <button type="button" className="filter-reset-btn" onClick={resetFilters}>Reset Filters</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  )
}
