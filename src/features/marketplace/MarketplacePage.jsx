// src/features/marketplace/MarketplacePage.jsx
import { useRef, useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CITIES, CONDITIONS, LISTINGS, MATERIAL_CATEGORIES } from '../../data/marketplace'
import { EmptySearchIcon } from '../../assets/icons/MarketplaceIcons'
import ListingCard, { ListingCardSkeleton } from '../../components/shared/ListingCard'
import { request } from '../../services/api'

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

// BE condition enum → label yang dipakai di filter sidebar
const CONDITION_MAP = {
  'GRADE_A': 'New/Surplus',
  'GRADE_B': 'Pre-loved/Good Condition',
  'GRADE_C': 'Fair/Minor Wear',
  'GRADE_D': 'Needs Repair',
}

// Sebaliknya: label filter → BE enum value (untuk query param)
const CONDITION_TO_ENUM = {
  'New/Surplus': 'GRADE_A',
  'Pre-loved/Good Condition': 'GRADE_B',
  'Fair/Minor Wear': 'GRADE_C',
  'Needs Repair': 'GRADE_D',
}

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `IDR ${n}`
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

// ── Skeleton grid saat loading ───────────────────────────────────────────────
const SKELETON_COUNT = 8
function SkeletonGrid() {
  return (
    <motion.div
      className="listing-grid"
      variants={gridVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <ListingCardSkeleton key={i} variants={cardVariants} />
      ))}
    </motion.div>
  )
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

  // null = belum ada data dari BE (pakai fallback lokal), array = dari BE
  const [listingsData, setListingsData] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Fetch dari BE setiap filter berubah ──────────────────────────────────
  useEffect(() => {
    setLoading(true)

    const query = new URLSearchParams()

    // City — BE support ilike filter via ?city=
    if (selectedCities.length) query.append('city', selectedCities[0])

    // Category — BE butuh category_slug (bukan name string)
    // MATERIAL_CATEGORIES berisi nama display, tapi BE filter pakai category_slug
    // Untuk sekarang: skip category filter ke BE, lakukan client-side saja
    // (karena kita tidak punya slug mapping di FE tanpa fetch categories dulu)

    // Condition — BE butuh GRADE_A/B/C/D
    if (selectedConditions.length === 1) {
      const enumVal = CONDITION_TO_ENUM[selectedConditions[0]]
      if (enumVal) query.append('condition', enumVal)
    }

    // Price range
    if (priceMin > 0) query.append('min_price', priceMin)
    if (priceMax < 10_000_000) query.append('max_price', priceMax)

    // Sort — BE support: newest, oldest, price_asc, price_desc
    const sortMap = {
      'Newest': 'newest',
      'Lowest Price': 'price_asc',
      'Highest Price': 'price_desc',
      'Oldest': 'oldest',
    }
    const beSort = sortMap[sortBy]
    if (beSort) query.append('sort', beSort)

    request(`/listings?${query.toString()}`)
      .then(res => {
        // BE returns { data: [...], pagination: {...} }
        const raw = Array.isArray(res?.data) ? res.data : []
        setListingsData(raw)
      })
      .catch(() => {
        console.warn('[MarketplacePage] BE unreachable — fallback to local LISTINGS')
        setListingsData(null) // null = pakai fallback lokal
      })
      .finally(() => setLoading(false))
  }, [selectedCities, selectedConditions, priceMin, priceMax, sortBy])

  // ── Sumber data: BE atau fallback lokal ──────────────────────────────────
  const sourceData = listingsData ?? LISTINGS

  // ── Client-side filtering (untuk hal yang belum dikirim ke BE) ──────────
  const filtered = useMemo(() => {
    let items = [...sourceData]

    // Category filter client-side (karena kita pakai nama display, bukan slug)
    if (selectedCategories.length) {
      items = items.filter(l => {
        // Dari BE: l.category = { name, slug } | dari lokal: l.category = string
        const catName = l.category?.name || l.category || ''
        return selectedCategories.includes(catName)
      })
    }

    // Status filter
    if (status !== 'All') {
      items = items.filter(l => {
        const s = l.status
        const isAvail = s === 'AVAILABLE' || s === 'Available'
        return status === 'Available' ? isAvail : !isAvail
      })
    }

    // Sort client-side (untuk "Highest Volume" yang tidak ada di BE)
    if (sortBy === 'Highest Volume') {
      items.sort((a, b) => {
        const va = a.estimated_weight_kg ?? a.volume?.value ?? 0
        const vb = b.estimated_weight_kg ?? b.volume?.value ?? 0
        return vb - va
      })
    }

    return items
  }, [sourceData, selectedCategories, status, sortBy])

  function toggleInList(value, list, setList) {
    setList(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value])
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
            <p className="market-sub">
              Filter by city, type, condition, and price — then view details to contact the seller.
            </p>
          </div>

          <div className="market-head-right">
            <div className="market-sort" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="market-label">Sort By</label>
              <div
                className="dd-root"
                ref={sortRef}
                tabIndex={-1}
                onBlur={e => { if (!sortRef.current?.contains(e.relatedTarget)) setSortOpen(false) }}
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
                    {['Newest', 'Lowest Price', 'Highest Price', 'Highest Volume'].map(opt => (
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
          {/* ── Left Sidebar ── */}
          <aside className="filter-card">
            <div className="filter-head">
              <div className="filter-title">Filters</div>
              <button type="button" className="filter-reset-link" onClick={resetFilters}>Reset</button>
            </div>

            {/* City */}
            <div className="filter-section">
              <div className="filter-label">City</div>
              <div className="filter-options">
                <div
                  className="dd-root"
                  ref={cityRef}
                  tabIndex={-1}
                  style={{ width: '100%' }}
                  onBlur={e => { if (!cityRef.current?.contains(e.relatedTarget)) setCityOpen(false) }}
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
                          onChange={e => setCitySearch(e.target.value)}
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
                      {CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(c => (
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

            {/* Material Type */}
            <div className="filter-section">
              <div className="filter-label">Material Type</div>
              <div className="filter-options">
                {MATERIAL_CATEGORIES.map(cat => (
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

            {/* Condition */}
            <div className="filter-section">
              <div className="filter-label">Condition</div>
              <div className="filter-options">
                {CONDITIONS.map(cond => (
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

            {/* Price Range */}
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
                  onChange={e => setPriceMin(clamp(Number(e.target.value), 0, priceMax))}
                />
                <input
                  className="range"
                  type="range"
                  min={0}
                  max={10_000_000}
                  step={50_000}
                  value={priceMax}
                  onChange={e => setPriceMax(clamp(Number(e.target.value), priceMin, 10_000_000))}
                />
              </div>
            </div>

            {/* Status */}
            <div className="filter-section">
              <div className="filter-label">Status</div>
              <div className="filter-options">
                {['All', 'Available', 'Sold Out'].map(s => (
                  <label key={s} className="radio">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={() => setStatus(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className="filter-reset-btn" onClick={resetFilters}>
              Reset Filter
            </button>
          </aside>

          {/* ── Right Grid ── */}
          <section className="listing-wrap">
            {loading ? (
              <SkeletonGrid />
            ) : filtered.length ? (
              <motion.div
                className="listing-grid"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                {filtered.map(l => (
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
                <button type="button" className="filter-reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  )
}