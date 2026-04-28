// src/components/shared/ListingCard.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Co2Badge from './Co2Badge'

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

// Mapping FE label → BE enum value
function mapCondition(condition) {
  switch (condition) {
    case 'NEW_SURPLUS': return { label: 'New', cls: 'cond-new' }
    case 'PRELOVED': return { label: 'Pre-loved', cls: 'cond-pre' }
    case 'NEEDS_REPAIR': return { label: 'Needs Repair', cls: 'cond-repair' }
    default:
      if (typeof condition === 'string') {
        if (condition.startsWith('New')) return { label: 'New', cls: 'cond-new' }
        if (condition.startsWith('Pre-loved')) return { label: 'Pre-loved', cls: 'cond-pre' }
      }
      return { label: condition || 'Unknown', cls: 'cond-repair' }
  }
}

// Ambil URL foto pertama dari format BE ({ url, is_primary, order_index })
// atau fallback ke format lokal (array of string)
function getPrimaryPhoto(listing) {
  // Format BE: photos: [{ url, is_primary, order_index }]
  if (Array.isArray(listing.photos) && listing.photos.length > 0) {
    const primary = listing.photos.find(p => p.is_primary) || listing.photos[0]
    return primary?.url || null
  }
  // Format lokal lama: images: ['url1', 'url2']
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    return listing.images[0]
  }
  return null
}

// ── Placeholder abu-abu saat tidak ada foto ─────────────────────────────────
function PhotoPlaceholder() {
  return (
    <div
      className="thumb-ph"
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #e8edf2 0%, #d4dce6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        color: '#94a3b8',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
        No photo
      </span>
    </div>
  )
}

// ── Gambar dengan fallback ke placeholder kalau broken ──────────────────────
function ListingThumb({ src, alt }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) return <PhotoPlaceholder />

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setErrored(true)}
    />
  )
}

// ── Shimmer skeleton saat data loading ──────────────────────────────────────
export function ListingCardSkeleton({ variants }) {
  return (
    <motion.article
      className="listing-card"
      variants={variants}
      style={{ pointerEvents: 'none' }}
    >
      {/* Thumb shimmer */}
      <div
        className="thumb"
        style={{
          background: 'linear-gradient(90deg, #e8edf2 25%, #f1f5f9 50%, #e8edf2 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }}
      />
      {/* Body shimmer */}
      <div className="card-body" style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <div className="shimmer-line" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
        <div className="shimmer-line" style={{ width: '80%', height: '16px', borderRadius: '4px' }} />
        <div className="shimmer-line" style={{ width: '55%', height: '12px', borderRadius: '4px' }} />
        <div className="shimmer-line" style={{ width: '45%', height: '12px', borderRadius: '4px', marginTop: '4px' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <div className="shimmer-line" style={{ width: '60px', height: '22px', borderRadius: '99px' }} />
          <div className="shimmer-line" style={{ width: '70px', height: '22px', borderRadius: '99px' }} />
        </div>
        <div className="shimmer-line" style={{ width: '50%', height: '18px', borderRadius: '4px', marginTop: '6px' }} />
      </div>

      {/* Inject shimmer keyframes sekali */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .shimmer-line {
          background: linear-gradient(90deg, #e8edf2 25%, #f1f5f9 50%, #e8edf2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>
    </motion.article>
  )
}

// ── Main ListingCard ─────────────────────────────────────────────────────────
export default function ListingCard({ listing, variants }) {
  const photoUrl = getPrimaryPhoto(listing)
  const cond = mapCondition(listing.condition)

  // BE: seller.full_name | lokal: seller.name
  const sellerName = listing.seller?.full_name || listing.seller?.name || 'Unknown'

  // Normalize status: BE pakai AVAILABLE/SOLD, lokal pakai Available/Sold Out
  const isAvailable =
    listing.status === 'AVAILABLE' ||
    listing.status === 'Available'

  // CO2: BE return estimated_co2_saved (number), lokal pakai co2SavedKg
  const co2Value = listing.estimated_co2_saved ?? listing.co2SavedKg ?? null

  // Volume: dari BE: estimated_weight_kg + unit | lokal: volume.value + unit
  const volumeValue = listing.estimated_weight_kg ?? listing.volume?.value
  const volumeUnit = listing.unit ?? listing.volume?.unit ?? 'kg'

  // Price: dari BE: price_per_unit | lokal: priceIdr
  const price = listing.price_per_unit ?? listing.priceIdr

  // Category name: dari BE: category.name (object) | lokal: category (string)
  const categoryLabel = listing.category?.name || listing.category || ''

  // Title: dari BE: title | lokal: name
  const titleLabel = listing.title || listing.name || ''

  return (
    <Link to={`/marketplace/${listing.id}`} className="listing-card-link">
      <motion.article className="listing-card" variants={variants}>
        <div className="thumb">
          <div className={`status-badge ${isAvailable ? 'status-ok' : 'status-sold'}`}>
            {isAvailable ? 'Available' : 'Sold'}
          </div>
          <ListingThumb src={photoUrl} alt={titleLabel} />
        </div>

        <div className="card-body">
          <div className="cat-badge">{categoryLabel}</div>
          <div className="card-title" title={titleLabel}>{titleLabel}</div>
          <div className="card-meta">
            {listing.city} • {volumeValue} {volumeUnit}
          </div>
          <div
            className="card-seller"
            style={{ fontSize: '0.8rem', color: 'rgba(0, 29, 61, 0.7)', marginTop: '0.2rem', marginBottom: '0.6rem' }}
          >
            Seller: <strong>{sellerName}</strong>
          </div>

          <div className="card-row" style={{ alignItems: 'center' }}>
            <span className={`cond-pill ${cond.cls}`}>{cond.label}</span>
            {co2Value != null && co2Value > 0 && <Co2Badge co2Value={co2Value} />}
          </div>

          <div className="card-price" style={{ marginTop: '0.8rem', marginBottom: '0.5rem' }}>
            {formatIdr(price)}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}