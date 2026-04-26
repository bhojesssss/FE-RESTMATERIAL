import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PlaceholderImageIcon } from '../../assets/icons/MarketplaceIcons'
import Co2Badge from './Co2Badge'

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `IDR ${n}`
  }
}

export default function ListingCard({ listing, variants }) {
  return (
    <Link to={`/marketplace/${listing.id}`}>
      <motion.article className="listing-card" variants={variants}>
        <div className="thumb">
          <div className={`status-badge ${listing.status === 'Available' ? 'status-ok' : 'status-sold'}`}>
            {listing.status === 'Available' ? 'Available' : 'Sold'}
          </div>
          {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.name} /> : (
            <div className="thumb-ph" aria-hidden="true">
              <PlaceholderImageIcon />
            </div>
          )}
        </div>

        <div className="card-body">
          <div className="cat-badge">{listing.category}</div>
          <div className="card-title" title={listing.name}>{listing.name}</div>
          <div className="card-meta">
            {listing.city} • {listing.volume?.value} {listing.volume?.unit}
          </div>
          <div className="card-seller" style={{ fontSize: '0.8rem', color: 'rgba(0, 29, 61, 0.7)', marginTop: '0.2rem', marginBottom: '0.6rem' }}>
            Seller: <strong>{listing.seller?.name || 'Unknown'}</strong>
          </div>

          <div className="card-row" style={{ alignItems: 'center' }}>
            <span className={`cond-pill ${listing.condition.startsWith('New') ? 'cond-new' : listing.condition.startsWith('Pre-loved') ? 'cond-pre' : 'cond-repair'}`}>
              {listing.condition.startsWith('New') ? 'New' : listing.condition.startsWith('Pre-loved') ? 'Pre-loved' : 'Needs Repair'}
            </span>
            {listing.co2SavedKg && <Co2Badge co2Value={listing.co2SavedKg} />}
          </div>
          <div className="card-price" style={{ marginTop: '0.8rem', marginBottom: '0.5rem' }}>{formatIdr(listing.priceIdr)}</div>

          {/* <Link to={`/marketplace/${listing.id}`}>View Details</Link> */}
        </div>
      </motion.article>
    </Link>
  )
}
