// src/features/marketplace/ListingDetailPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LISTINGS } from "../../data/marketplace";
import Co2Badge from "../../components/shared/Co2Badge";
import { request } from "../../services/api";
import { getCachedSession } from "../../features/auth/auth";
import OrderModal from "./OrderModal";

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

function formatIdr(n) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  } catch { return `IDR ${n}`; }
}

function mapCondition(condition) {
  switch (condition) {
    case "NEW_SURPLUS": return { label: "New / Surplus", cls: "cond-new" };
    case "PRELOVED": return { label: "Pre-loved", cls: "cond-pre" };
    case "NEEDS_REPAIR": return { label: "Needs Repair", cls: "cond-repair" };
    default:
      if (typeof condition === "string") {
        if (condition.startsWith("New")) return { label: "New", cls: "cond-new" };
        if (condition.startsWith("Pre-loved")) return { label: "Pre-loved", cls: "cond-pre" };
      }
      return { label: condition || "—", cls: "cond-repair" };
  }
}

function getPhotoUrls(listing) {
  if (Array.isArray(listing.photos) && listing.photos.length > 0)
    return listing.photos.map(p => p.url).filter(Boolean);
  if (Array.isArray(listing.images) && listing.images.length > 0)
    return listing.images.filter(Boolean);
  return [];
}

function GalleryPlaceholder() {
  return (
    <div className="detail-ph" aria-hidden="true" style={{
      width: "100%", aspectRatio: "4/3",
      background: "linear-gradient(135deg, #e8edf2 0%, #d4dce6 100%)",
      borderRadius: "12px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "12px", color: "#94a3b8",
    }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
        No photos yet
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <motion.main className="market-shell" {...pageMotion}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .sk { background: linear-gradient(90deg, #e8edf2 25%, #f1f5f9 50%, #e8edf2 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
      `}</style>
      <div className="market-inner">
        <div className="detail-top"><div className="sk" style={{ width: 140, height: 16 }} /></div>
        <div className="detail-layout">
          <section className="detail-left">
            <div className="sk" style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[80, 100, 90].map(w => <div key={w} className="sk" style={{ width: w, height: 24, borderRadius: 99 }} />)}
            </div>
            <div className="sk" style={{ width: "70%", height: 28, marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[1, 2, 3].map(i => <div key={i} className="sk" style={{ height: 48, borderRadius: 8 }} />)}
            </div>
            <div className="sk" style={{ width: "40%", height: 32, marginBottom: 20 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["100%", "90%", "75%"].map(w => <div key={w} className="sk" style={{ width: w, height: 14 }} />)}
            </div>
          </section>
          <aside className="detail-right">
            <div className="seller-card">
              <div className="sk" style={{ width: "100%", height: 240, borderRadius: 10 }} />
            </div>
          </aside>
        </div>
      </div>
    </motion.main>
  );
}

function normalizeListing(data) {
  return {
    ...data,
    name: data.title || data.name || "",
    priceIdr: data.price_per_unit ?? data.priceIdr,
    weightKg: data.estimated_weight_kg ?? data.weightKg,
    volume: data.volume || { value: data.estimated_weight_kg, unit: data.unit || "kg" },
    status: data.status === "AVAILABLE" ? "Available" : data.status === "SOLD" ? "Sold" : data.status,
    co2SavedKg: data.estimated_co2_saved ?? data.co2SavedKg ?? null,
    uploadedAt: data.created_at ? String(data.created_at).slice(0, 10) : data.uploadedAt || "",
    category: data.category?.name || data.category || "",
  };
}

export default function ListingDetailPage() {
  void motion;
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getCachedSession();

  const [listing, setListing] = useState(null);
  const [otherFromSeller, setOtherFromSeller] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActivePhoto(0);
    setImgError(false);

    request(`/listings/${id}`)
      .then(data => {
        setListing(normalizeListing(data));
        setOtherFromSeller([]);
      })
      .catch(() => {
        const local = LISTINGS.find(l => String(l.id) === String(id));
        if (local) {
          setListing(normalizeListing(local));
          setOtherFromSeller(LISTINGS.filter(l => l.seller?.id === local.seller?.id && l.id !== local.id).map(normalizeListing));
        } else {
          setListing(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!listing) {
    return (
      <motion.main className="market-shell" {...pageMotion}>
        <div className="market-inner">
          <div className="empty">
            <div className="empty-title">Listing not found</div>
            <div className="empty-sub">This item may have been removed or the link is invalid.</div>
            <button type="button" className="filter-reset-btn" onClick={() => navigate("/marketplace", { replace: true })}>
              Back to Marketplace
            </button>
          </div>
        </div>
      </motion.main>
    );
  }

  const photos = getPhotoUrls(listing);
  const hasPhotos = photos.length > 0;
  const cond = mapCondition(listing.condition);
  const isAvailable = listing.status === "Available";
  const isOwnListing = session?.userId && listing.seller?.id &&
    String(session.userId) === String(listing.seller.id);

  const sellerName = listing.seller?.full_name || listing.seller?.name || "Unknown Seller";
  const sellerInitial = sellerName.slice(0, 1).toUpperCase();
  const sellerCity = listing.seller?.city || "";
  const sellerSince = String(listing.seller?.created_at || listing.seller?.memberSince || "").slice(0, 7);
  const sellerRating = listing.seller?.rating_avg ?? listing.seller?.rating ?? null;

  function handleContactSeller() {
    if (!session) { window.location.href = "/login"; return; }
    window.dispatchEvent(new CustomEvent("open-chat", {
      detail: {
        listingId: listing.id,
        sellerName: listing.seller?.full_name || "Seller",
        firstMessage: `Halo, saya tertarik dengan "${listing.title}"`,
      },
    }));
  }

  function handleOrderClick() {
    if (!session) { window.location.href = "/login"; return; }
    setShowOrderModal(true);
  }

  return (
    <>
      <motion.main className="market-shell" {...pageMotion}>
        <div className="market-inner">
          <div className="detail-top">
            <Link className="back-link" to="/marketplace">← Back to Marketplace</Link>
          </div>

          <div className="detail-layout">
            {/* ── Left 60% ── */}
            <section className="detail-left">
              <div className="detail-gallery">
                {hasPhotos && !imgError ? (
                  <img src={photos[activePhoto]} alt={listing.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setImgError(true)} />
                ) : (
                  <GalleryPlaceholder />
                )}
              </div>

              {hasPhotos && photos.length > 1 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {photos.map((url, i) => (
                    <button key={i} type="button"
                      onClick={() => { setActivePhoto(i); setImgError(false); }}
                      aria-label={`View photo ${i + 1}`}
                      style={{
                        width: "60px", height: "60px", borderRadius: "6px",
                        overflow: "hidden", padding: 0, cursor: "pointer", flexShrink: 0,
                        border: i === activePhoto ? "2px solid #003566" : "2px solid transparent",
                      }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}

              <div className="detail-badges" style={{ marginTop: "16px" }}>
                <span className={`detail-status ${isAvailable ? "status-ok" : "status-sold"}`}>
                  {isAvailable ? "Available" : "Sold"}
                </span>
                <span className="detail-cat">{listing.category}</span>
                <span className={`cond-pill ${cond.cls}`}>{cond.label}</span>
              </div>

              <h1 className="detail-title">{listing.name}</h1>

              <div className="detail-specs">
                <div className="spec"><div className="spec-k">Location</div><div className="spec-v">{listing.city || "—"}</div></div>
                <div className="spec"><div className="spec-k">Listed On</div><div className="spec-v">{listing.uploadedAt || "—"}</div></div>
                <div className="spec">
                  <div className="spec-k">Quantity</div>
                  <div className="spec-v">{listing.quantity ?? listing.volume?.value} {listing.unit ?? listing.volume?.unit ?? "kg"}</div>
                </div>
                {listing.address && <div className="spec"><div className="spec-k">Address</div><div className="spec-v">{listing.address}</div></div>}
                {listing.view_count != null && <div className="spec"><div className="spec-k">Views</div><div className="spec-v">{listing.view_count}</div></div>}
              </div>

              <div className="detail-price">{formatIdr(listing.priceIdr)}</div>

              {listing.description && (
                <div className="detail-desc">
                  <div className="detail-section-title">Description</div>
                  <p>{listing.description}</p>
                </div>
              )}

              {listing.co2SavedKg != null && listing.co2SavedKg > 0 && (
                <div className="carbon-card">
                  <div className="carbon-kicker">Carbon Saving Estimate</div>
                  <div className="carbon-text" style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.2rem" }}>
                    <Co2Badge co2Value={listing.co2SavedKg} className="co2-badge--large" />
                    <span>This transaction prevents CO₂e emissions</span>
                  </div>
                  <div className="carbon-sub">Estimation based on standardized ICE Database factors.</div>
                </div>
              )}

              <div className="detail-section">
                <div className="detail-section-title">Other materials from this seller</div>
                {otherFromSeller.length ? (
                  <div className="seller-row">
                    {otherFromSeller.map(o => (
                      <Link key={o.id} className="mini-card" to={`/marketplace/${o.id}`}>
                        <div className="mini-thumb" aria-hidden="true" />
                        <div className="mini-body">
                          <div className="mini-title" title={o.name}>{o.name}</div>
                          <div className="mini-meta">{o.city} • {o.quantity ?? o.volume?.value} {o.unit ?? o.volume?.unit ?? "kg"}</div>
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

            {/* ── Right 40% ── */}
            <aside className="detail-right">
              <div className="seller-card">
                <div className="seller-top">
                  <div className="seller-avatar" aria-hidden="true"><span>{sellerInitial}</span></div>
                  <div>
                    <div className="seller-name">{sellerName}</div>
                    <div className="seller-meta">
                      {sellerCity && `${sellerCity} • `}
                      {sellerSince && `Member since ${sellerSince}`}
                    </div>
                  </div>
                </div>

                {sellerRating != null && (
                  <div className="seller-trust">
                    <div className="trust-k">Rating</div>
                    <div className="trust-v">{Number(sellerRating).toFixed(1)} / 5</div>
                  </div>
                )}

                <div style={{ height: "1px", background: "#f1f5f9", margin: "14px 0" }} />

                {/* ── CTAs ── */}
                {isOwnListing ? (
                  <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.8rem", color: "#64748b", textAlign: "center", marginBottom: "8px" }}>
                    Ini listing milikmu
                  </div>
                ) : (
                  <>
                    {/* PRIMARY: Order Now */}
                    <button
                      type="button"
                      className="auth-btn auth-btn-primary seller-cta"
                      disabled={!isAvailable}
                      onClick={handleOrderClick}
                      style={{ width: "100%", marginBottom: "8px" }}
                    >
                      {isAvailable ? "Order Now" : "Tidak Tersedia"}
                    </button>

                    {/* SECONDARY: Contact Seller */}
                    <button
                      type="button"
                      className="auth-btn auth-btn-outline seller-cta"
                      onClick={handleContactSeller}
                      style={{ width: "100%", marginBottom: "8px" }}
                    >
                      Contact Seller
                    </button>
                  </>
                )}

                <button type="button" className="auth-btn auth-btn-outline seller-cta" style={{ width: "100%" }}>
                  Save to Wishlist
                </button>

                <div className="seller-note">
                  Tip: Tanya seller dulu soal jadwal pickup dan kondisi detail sebelum order.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </motion.main>

      {showOrderModal && (
        <OrderModal listing={listing} onClose={() => setShowOrderModal(false)} />
      )}
    </>
  );
}