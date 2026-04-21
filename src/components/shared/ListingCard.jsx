import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PlaceholderImageIcon } from '../../assets/icons/MarketplaceIcons'

function formatIdr(n) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `IDR ${n}`
  }
}

export default function ListingCard({ listing, variants }) {
  return (
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

        <div className="card-row">
          <span className={`cond-pill ${listing.condition.startsWith('New') ? 'cond-new' : listing.condition.startsWith('Pre-loved') ? 'cond-pre' : 'cond-repair'}`}>
            {listing.condition.startsWith('New') ? 'New' : listing.condition.startsWith('Pre-loved') ? 'Pre-loved' : 'Needs Repair'}
          </span>
          <div className="card-price">{formatIdr(listing.priceIdr)}</div>
        </div>

        <Link className="card-cta" to={`/marketplace/${listing.id}`}>View Details</Link>
      </div>
    </motion.article>
  )
}
