// src/features/marketplace/MarketplacePage.jsx
import { useRef, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CITIES, CONDITIONS, LISTINGS, MATERIAL_CATEGORIES } from '../../data/marketplace'
import { EmptySearchIcon } from '../../assets/icons/MarketplaceIcons'
import ListingCard, { ListingCardSkeleton } from '../../components/shared/ListingCard'
import { request } from '../../services/api'

const PAGE_SIZE = 6

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// MarketplacePage.jsx
const CONDITION_TO_ENUM = {
  'New/Surplus': 'NEW_SURPLUS',
  'Pre-loved': 'PRELOVED',
  'Needs Repair': 'NEEDS_REPAIR',
}

// Data lokal di-sort sekali stabil — by uploadedAt desc, fallback by id
const LOCAL_LISTINGS_SORTED = [...LISTINGS].sort((a, b) => {
  const da = String(a.uploadedAt || a.created_at || '')
  const db = String(b.uploadedAt || b.created_at || '')
  if (db !== da) return db.localeCompare(da)
  return String(a.id).localeCompare(String(b.id))
})

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(n)
  } catch { return `IDR ${n}` }
}

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)) }

function SkeletonGrid() {
  return (
    <motion.div className="listing-grid" variants={gridVariants} initial="hidden" animate="show">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <ListingCardSkeleton key={i} variants={cardVariants} />
      ))}
    </motion.div>
  )
}

// ── Pagination controls ──────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const btnStyle = (active, disabled) => ({
    minWidth: '36px',
    height: '36px',
    padding: '0 10px',
    borderRadius: '8px',
    border: active ? '1.5px solid #003566' : '1.5px solid #e2e8f0',
    background: active ? '#003566' : '#fff',
    color: active ? '#fff' : disabled ? '#cbd5e1' : '#334155',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2rem', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}
        style={btnStyle(false, page === 1)} aria-label="Previous page">
        ←
      </button>

      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`el-${i}`} style={{ padding: '0 4px', color: '#94a3b8', userSelect: 'none' }}>…</span>
          : <button type="button" key={p} onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            style={btnStyle(p === page, false)}>
            {p}
          </button>
      )}

      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages}
        style={btnStyle(false, page === totalPages)} aria-label="Next page">
        →
      </button>
    </div>
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
  const [page, setPage] = useState(1)

  const sortRef = useRef(null)
  const cityRef = useRef(null)
  const gridRef = useRef(null)

  // null = pakai LOCAL_LISTINGS_SORTED sebagai fallback, array = dari BE
  const [listingsData, setListingsData] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Fetch dari BE ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)

    const query = new URLSearchParams()
    if (selectedCities.length) query.append('city', selectedCities[0])
    if (selectedConditions.length === 1) {
      const enumVal = CONDITION_TO_ENUM[selectedConditions[0]]
      if (enumVal) query.append('condition', enumVal)
    }
    if (priceMin > 0) query.append('min_price', String(priceMin))
    if (priceMax < 10_000_000) query.append('max_price', String(priceMax))

    // Sort — BE support: newest, oldest, price_asc, price_desc
    const sortMap = { 'Newest': 'newest', 'Lowest Price': 'price_asc', 'Highest Price': 'price_desc' }
    const beSort = sortMap[sortBy]
    if (beSort) query.append('sort', beSort)

    // Fetch limit besar supaya pagination client-side bisa akurat
    query.append('limit', '50')

    request(`/listings?${query.toString()}`)
      .then(res => {
        const raw = Array.isArray(res?.data) ? res.data : []
        setListingsData(raw)
        setPage(1)
      })
      .catch(() => {
        console.warn('[MarketplacePage] fallback to local')
        setListingsData(null)
        setPage(1)
      })
      .finally(() => setLoading(false))
  }, [selectedCities, selectedConditions, priceMin, priceMax, sortBy])

  const sourceData = listingsData ?? LOCAL_LISTINGS_SORTED

  // ── Client-side filter (category + status + volume sort) ──────────────────
  const allFiltered = useMemo(() => {
    let items = [...sourceData]

    if (selectedCategories.length) {
      items = items.filter(l => {
        const catName = l.category?.name || l.category || ''
        return selectedCategories.includes(catName)
      })
    }

    if (status !== 'All') {
      items = items.filter(l => {
        const isAvail = l.status === 'AVAILABLE' || l.status === 'Available'
        return status === 'Available' ? isAvail : !isAvail
      })
    }

    if (sortBy === 'Highest Volume') {
      items.sort((a, b) => {
        const va = a.estimated_weight_kg ?? a.volume?.value ?? 0
        const vb = b.estimated_weight_kg ?? b.volume?.value ?? 0
        return vb - va
      })
    }

    return items
  }, [sourceData, selectedCategories, status, sortBy])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return allFiltered.slice(start, start + PAGE_SIZE)
  }, [allFiltered, safePage])

  function handlePageChange(newPage) {
    setPage(newPage)
    // Scroll ke atas grid
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function toggleInList(value, list, setList) {
    setList(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value])
    setPage(1)
  }

  function resetFilters() {
    setSelectedCities([])
    setSelectedCategories([])
    setSelectedConditions([])
    setStatus('All')
    setSortBy('Newest')
    setPriceMin(0)
    setPriceMax(10_000_000)
    setPage(1)
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
              <div className="dd-root" ref={sortRef} tabIndex={-1}
                onBlur={e => { if (!sortRef.current?.contains(e.relatedTarget)) setSortOpen(false) }}>
                <button type="button" className="market-dropdown-btn" style={{ width: '160px' }}
                  onClick={() => setSortOpen(o => !o)} aria-haspopup="listbox" aria-expanded={sortOpen}>
                  {sortBy}
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ width: '18px', height: '18px', color: '#9ca3af', marginLeft: 'auto', flexShrink: 0, transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="market-dropdown-menu" style={{ width: '160px' }} role="listbox">
                    {['Newest', 'Lowest Price', 'Highest Price', 'Highest Volume'].map(opt => (
                      <button type="button" key={opt} role="option" aria-selected={sortBy === opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); setPage(1) }}
                        className={`market-dropdown-item${sortBy === opt ? ' market-dropdown-item--active' : ''}`}>
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
          {/* ── Sidebar ── */}
          <aside className="filter-card">
            <div className="filter-head">
              <div className="filter-title">Filters</div>
              <button type="button" className="filter-reset-link" onClick={resetFilters}>Reset</button>
            </div>

            <div className="filter-section">
              <div className="filter-label">City</div>
              <div className="filter-options">
                <div className="dd-root" ref={cityRef} tabIndex={-1} style={{ width: '100%' }}
                  onBlur={e => { if (!cityRef.current?.contains(e.relatedTarget)) setCityOpen(false) }}>
                  <button type="button" className="market-dropdown-btn" style={{ width: '100%' }}
                    onClick={() => setCityOpen(o => !o)} aria-haspopup="listbox" aria-expanded={cityOpen}>
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
                        <input type="text" placeholder="Search city..." value={citySearch} autoFocus
                          onChange={e => setCitySearch(e.target.value)} className="market-search-input" />
                      </div>
                      <button type="button" role="option" aria-selected={!selectedCities.length}
                        onClick={() => { setSelectedCities([]); setCitySearch(''); setCityOpen(false); setPage(1) }}
                        className={`market-dropdown-item${!selectedCities.length ? ' market-dropdown-item--active' : ''}`}>
                        All Cities
                      </button>
                      {CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(c => (
                        <button type="button" key={c} role="option" aria-selected={selectedCities[0] === c}
                          onClick={() => { setSelectedCities([c]); setCitySearch(''); setCityOpen(false); setPage(1) }}
                          className={`market-dropdown-item${selectedCities[0] === c ? ' market-dropdown-item--active' : ''}`}>
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
                {MATERIAL_CATEGORIES.map(cat => (
                  <label key={cat} className="check">
                    <input type="checkbox" checked={selectedCategories.includes(cat)}
                      onChange={() => toggleInList(cat, selectedCategories, setSelectedCategories)} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Condition</div>
              <div className="filter-options">
                {CONDITIONS.map(cond => (
                  <label key={cond} className="check">
                    <input type="checkbox" checked={selectedConditions.includes(cond)}
                      onChange={() => toggleInList(cond, selectedConditions, setSelectedConditions)} />
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
                <input className="range" type="range" min={0} max={10_000_000} step={50_000} value={priceMin}
                  onChange={e => { setPriceMin(clamp(Number(e.target.value), 0, priceMax)); setPage(1) }} />
                <input className="range" type="range" min={0} max={10_000_000} step={50_000} value={priceMax}
                  onChange={e => { setPriceMax(clamp(Number(e.target.value), priceMin, 10_000_000)); setPage(1) }} />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Status</div>
              <div className="filter-options">
                {['All', 'Available', 'Sold Out'].map(s => (
                  <label key={s} className="radio">
                    <input type="radio" name="status" value={s} checked={status === s}
                      onChange={() => { setStatus(s); setPage(1) }} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className="filter-reset-btn" onClick={resetFilters}>Reset Filter</button>
          </aside>

          {/* ── Grid + Pagination ── */}
          <section className="listing-wrap">
            {/* Anchor scroll target */}
            <div ref={gridRef} style={{ scrollMarginTop: '80px' }} />

            {loading ? (
              <SkeletonGrid />
            ) : paginated.length ? (
              <>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  {allFiltered.length} material{allFiltered.length !== 1 ? 's' : ''} found
                  {totalPages > 1 && ` · Halaman ${safePage} dari ${totalPages}`}
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-${safePage}`}
                    className="listing-grid"
                    variants={gridVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    {paginated.map(l => (
                      <ListingCard key={l.id} listing={l} variants={cardVariants} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                <Pagination page={safePage} totalPages={totalPages} onChange={handlePageChange} />
              </>
            ) : (
              <div className="empty">
                <div className="empty-ill" aria-hidden="true"><EmptySearchIcon /></div>
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