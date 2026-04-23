import { useRef, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CITIES, CONDITIONS, LISTINGS, MATERIAL_CATEGORIES } from '../../data/marketplace'
import { EmptySearchIcon } from '../../assets/icons/MarketplaceIcons'
import ListingCard from '../../components/shared/ListingCard'
// here fetch api tp integrated backend
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
  const [citySearch, setCitySearch] = useState('')
  const [sortOpen, setSortOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const sortRef = useRef(null)
  const cityRef = useRef(null)

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
            <div className="market-sort" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="market-label">Sort By</label>
              <div
                className="dd-root"
                ref={sortRef}
                tabIndex={-1}
                onBlur={(e) => { if (!sortRef.current?.contains(e.relatedTarget)) setSortOpen(false) }}
              >
                <button
                  type="button"
                  className="market-dropdown-btn"
                  style={{ width: '160px' }}
                  onClick={() => setSortOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  {sortBy}
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ width: '18px', height: '18px', color: '#9ca3af', marginLeft: 'auto', flexShrink: 0, transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="market-dropdown-menu" style={{ width: '160px' }} role="listbox">
                    {['Newest', 'Lowest Price', 'Highest Volume'].map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false) }}
                        className={`market-dropdown-item${sortBy === opt ? ' market-dropdown-item--active' : ''}`}
                        role="option"
                        aria-selected={sortBy === opt}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                <div
                  className="dd-root"
                  ref={cityRef}
                  tabIndex={-1}
                  style={{ width: '100%' }}
                  onBlur={(e) => { if (!cityRef.current?.contains(e.relatedTarget)) { setCityOpen(false) } }}
                >
                  <button
                    type="button"
                    className="market-dropdown-btn"
                    style={{ width: '100%' }}
                    onClick={() => setCityOpen(o => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={cityOpen}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedCities.length ? selectedCities[0] : 'All Cities'}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ width: '18px', height: '18px', color: '#9ca3af', marginLeft: 'auto', flexShrink: 0, transform: cityOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                      <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                  </button>
                  {cityOpen && (
                    <div className="market-dropdown-menu has-custom-scroll" style={{ width: '100%', maxHeight: '240px', overflowY: 'auto' }} role="listbox">
                      <div style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                        <input
                          type="text"
                          placeholder="Search city..."
                          value={citySearch}
                          autoFocus
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="market-search-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedCities([]); setCitySearch(''); setCityOpen(false) }}
                        className={`market-dropdown-item${!selectedCities.length ? ' market-dropdown-item--active' : ''}`}
                        role="option"
                        aria-selected={!selectedCities.length}
                      >
                        All Cities
                      </button>
                      {CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => { setSelectedCities([c]); setCitySearch(''); setCityOpen(false) }}
                          className={`market-dropdown-item${selectedCities[0] === c ? ' market-dropdown-item--active' : ''}`}
                          role="option"
                          aria-selected={selectedCities[0] === c}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  <ListingCard key={l.id} listing={l} variants={cardVariants} />
                ))}
              </motion.div>
            ) : (
              <div className="empty">
                <div className="empty-ill" aria-hidden="true">
                  <EmptySearchIcon />
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
