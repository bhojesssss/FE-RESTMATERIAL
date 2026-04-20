import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LISTINGS } from '../../data/marketplace'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `IDR ${n}`
  }
}

function estimateCo2Kg(listing) {
  const v = Number(listing?.volume?.value || 0)
  const unit = listing?.volume?.unit
  const baseKg = unit === 'kg' ? v : unit === 'pcs' ? v * 1.6 : unit === 'boxes' ? v * 18 : v * 12
  const factor = listing?.category?.includes('Steel') ? 1.9 : listing?.category?.includes('Wood') ? 0.9 : 1.2
  return Math.max(6, Math.round(baseKg * factor * 0.35))
}

export default function ListingDetailPage() {
  void motion
  const { id } = useParams()
  const navigate = useNavigate()

  const listing = useMemo(() => LISTINGS.find((l) => l.id === id), [id])
  const otherFromSeller = useMemo(() => {
    if (!listing) return []
    return LISTINGS.filter((l) => l.seller?.id === listing.seller?.id && l.id !== listing.id)
  }, [listing])

  if (!listing) {
    return (
      <motion.main className="market-shell" {...pageMotion}>
        <div className="market-inner">
          <div className="empty">
            <div className="empty-title">Listing not found</div>
            <div className="empty-sub">This item may have been removed.</div>
            <button type="button" className="filter-reset-btn" onClick={() => navigate('/marketplace', { replace: true })}>
              Back to Marketplace
            </button>
          </div>
        </div>
      </motion.main>
    )
  }

  const co2 = estimateCo2Kg(listing)

  return (
    <motion.main className="market-shell" {...pageMotion}>
      <div className="market-inner">
        <div className="detail-top">
          <Link className="back-link" to="/marketplace">← Back to Marketplace</Link>
        </div>

        <div className="detail-layout">
          {/* Left 60% */}
          <section className="detail-left">
            <div className="detail-gallery">
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.name} />
              ) : (
                <div className="detail-ph" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M8 13l2.5 2.5L16 10" />
                  </svg>
                </div>
              )}
            </div>

            <div className="detail-badges">
              <span className={`detail-status ${listing.status === 'Available' ? 'status-ok' : 'status-sold'}`}>
                {listing.status === 'Available' ? 'Available' : 'Sold'}
              </span>
              <span className="detail-cat">{listing.category}</span>
              <span className={`cond-pill ${listing.condition.startsWith('New') ? 'cond-new' : listing.condition.startsWith('Pre-loved') ? 'cond-pre' : 'cond-repair'}`}>
                {listing.condition.startsWith('New') ? 'New' : listing.condition.startsWith('Pre-loved') ? 'Pre-loved' : 'Needs Repair'}
              </span>
            </div>

            <h1 className="detail-title">{listing.name}</h1>

            <div className="detail-specs">
              <div className="spec">
                <div className="spec-k">Location</div>
                <div className="spec-v">{listing.city}</div>
              </div>
              <div className="spec">
                <div className="spec-k">Upload Date</div>
                <div className="spec-v">{listing.uploadedAt}</div>
              </div>
              <div className="spec">
                <div className="spec-k">Total Volume</div>
                <div className="spec-v">{listing.volume?.value} {listing.volume?.unit}</div>
              </div>
            </div>

            <div className="detail-price">{formatIdr(listing.priceIdr)}</div>

            <div className="detail-desc">
              <div className="detail-section-title">Description</div>
              <p>{listing.description}</p>
            </div>

            <div className="carbon-card">
              <div className="carbon-kicker">Carbon Saving Estimate</div>
              <div className="carbon-text">This transaction potentially prevents <strong>~{co2} kg of CO2e</strong></div>
              <div className="carbon-sub">Estimation based on category and volume.</div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Other materials from this seller</div>
              {otherFromSeller.length ? (
                <div className="seller-row">
                  {otherFromSeller.map((o) => (
                    <Link key={o.id} className="mini-card" to={`/marketplace/${o.id}`}>
                      <div className="mini-thumb" aria-hidden="true" />
                      <div className="mini-body">
                        <div className="mini-title" title={o.name}>{o.name}</div>
                        <div className="mini-meta">{o.city} • {o.volume?.value} {o.volume?.unit}</div>
                        <div className="mini-price">{formatIdr(o.priceIdr)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="detail-muted">No other listings from this seller yet.</div>
              )}
            </div>
          </section>

          {/* Right 40% */}
          <aside className="detail-right">
            <div className="seller-card">
              <div className="seller-top">
                <div className="seller-avatar" aria-hidden="true">
                  <span>{String(listing.seller?.name || 'S').slice(0, 1).toUpperCase()}</span>
                </div>
                <div>
                  <div className="seller-name">{listing.seller?.name}</div>
                  <div className="seller-meta">{listing.seller?.city} • Member Since {String(listing.seller?.memberSince).slice(0, 7)}</div>
                </div>
              </div>

              <div className="seller-trust">
                <div className="trust-k">Rating / Trust</div>
                <div className="trust-v">{listing.seller?.rating} / 5</div>
              </div>

              <button type="button" className="auth-btn auth-btn-primary seller-cta" disabled={listing.status !== 'Available'}>
                Contact Seller
              </button>
              <button type="button" className="auth-btn auth-btn-outline seller-cta">
                Save to Wishlist
              </button>

              <div className="seller-note">
                Tip: Use detailed messages (material specs, pickup time, and transport) to close deals faster.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.main>
  )
}
