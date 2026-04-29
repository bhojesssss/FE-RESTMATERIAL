// src/features/marketplace/OrderModal.jsx
// Modal untuk buat order dari ListingDetailPage
// Handles: POST /api/transactions
// State transitions yang di-handle di sini: none → PENDING

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { request } from '../../services/api'

const DELIVERY_OPTIONS = [
    {
        value: 'SELF_PICKUP',
        label: 'Self Pickup',
        desc: 'Kamu ambil langsung ke lokasi seller',
    },
    {
        value: 'DELIVERY',
        label: 'Delivery',
        desc: 'Seller kirim ke alamatmu (delivery fee menyusul)',
    },
]

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

// ── Overlay backdrop ─────────────────────────────────────────────────────────
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

const modalVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } },
}

export default function OrderModal({ listing, onClose }) {
    const navigate = useNavigate()

    const maxQty = listing.quantity ?? listing.volume?.value ?? 1
    const unitLabel = listing.unit ?? listing.volume?.unit ?? 'unit'
    const pricePerUnit = listing.price_per_unit ?? listing.priceIdr ?? 0

    const [qty, setQty] = useState(1)
    const [deliveryMethod, setDeliveryMethod] = useState('SELF_PICKUP')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [buyerMessage, setBuyerMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    const totalPrice = qty * pricePerUnit

    function validate() {
        const errs = {}
        if (!qty || qty <= 0 || qty > maxQty) {
            errs.qty = `Quantity harus antara 0.001 dan ${maxQty} ${unitLabel}`
        }
        if (deliveryMethod === 'DELIVERY' && !deliveryAddress.trim()) {
            errs.deliveryAddress = 'Alamat pengiriman wajib diisi kalau pilih Delivery'
        }
        if (deliveryAddress && deliveryAddress.trim().length < 5) {
            errs.deliveryAddress = 'Alamat terlalu singkat (min 5 karakter)'
        }
        return errs
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitError(null)

        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                listing_id: listing.id,
                quantity: Number(qty),
                delivery_method: deliveryMethod,
                ...(deliveryMethod === 'DELIVERY' && {
                    delivery_address: deliveryAddress.trim(),
                }),
                ...(buyerMessage.trim() && { buyer_message: buyerMessage.trim() }),
            }

            const res = await request('/transactions', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            // Berhasil — redirect ke halaman detail transaksi
            onClose()
            navigate(`/transactions/${res.transaction.id}`)
        } catch (err) {
            setSubmitError(err.message || 'Gagal membuat order. Coba lagi.')
        } finally {
            setSubmitting(false)
        }
    }

    // Tutup modal kalau klik backdrop
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <AnimatePresence>
            <motion.div
                key="order-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleBackdropClick}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 21, 46, 0.55)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}
            >
                <motion.div
                    key="order-modal"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        background: '#fff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 24px 64px rgba(0,21,46,0.18)',
                        overflow: 'hidden',
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Place Order"
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#003566', marginBottom: '4px' }}>
                                Place Order
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0d1b2a', lineHeight: 1.3 }}>
                                {listing.title || listing.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                {listing.city} · Seller: {listing.seller?.full_name || listing.seller?.name || 'Unknown'}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.4rem',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '0 4px',
                                lineHeight: 1,
                                flexShrink: 0,
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                        {/* Quantity */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Quantity ({unitLabel})
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setQty(q => Math.max(1, Number(q) - 1))}
                                    disabled={qty <= 1}
                                    style={qtyBtnStyle}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="0.001"
                                    max={maxQty}
                                    step="0.001"
                                    value={qty}
                                    onChange={e => {
                                        setQty(e.target.value)
                                        if (errors.qty) setErrors(prev => ({ ...prev, qty: '' }))
                                    }}
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                        padding: '8px',
                                        border: errors.qty ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setQty(q => Math.min(maxQty, Number(q) + 1))}
                                    disabled={qty >= maxQty}
                                    style={qtyBtnStyle}
                                >
                                    +
                                </button>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    / {maxQty} {unitLabel} tersedia
                                </span>
                            </div>
                            {errors.qty && (
                                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{errors.qty}</p>
                            )}
                        </div>

                        {/* Price preview */}
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {qty} {unitLabel} × {formatIdr(pricePerUnit)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Harga final dikonfirmasi seller
                                </div>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#003566' }}>
                                {formatIdr(totalPrice)}
                            </div>
                        </div>

                        {/* Delivery method */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                                Metode Pengambilan
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {DELIVERY_OPTIONS.map(opt => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            border: deliveryMethod === opt.value ? '1.5px solid #003566' : '1.5px solid #e2e8f0',
                                            background: deliveryMethod === opt.value ? '#f0f5ff' : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value={opt.value}
                                            checked={deliveryMethod === opt.value}
                                            onChange={() => setDeliveryMethod(opt.value)}
                                            style={{ marginTop: '2px', accentColor: '#003566' }}
                                        />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                                                {opt.label}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>
                                                {opt.desc}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Delivery address — conditional */}
                        <AnimatePresence>
                            {deliveryMethod === 'DELIVERY' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
                                >
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Alamat Pengiriman *
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Jl. Sudirman No. 1, Jakarta Pusat 10220"
                                        value={deliveryAddress}
                                        onChange={e => {
                                            setDeliveryAddress(e.target.value)
                                            if (errors.deliveryAddress) setErrors(prev => ({ ...prev, deliveryAddress: '' }))
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: errors.deliveryAddress ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                    {errors.deliveryAddress && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                                            {errors.deliveryAddress}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Buyer message */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Pesan untuk Seller{' '}
                                <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opsional)</span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Contoh: Ada loading dock? Jadwal pickup pagi bisa?"
                                value={buyerMessage}
                                onChange={e => setBuyerMessage(e.target.value)}
                                maxLength={500}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', marginTop: '2px' }}>
                                {buyerMessage.length}/500
                            </div>
                        </div>

                        {/* Submit error */}
                        {submitError && (
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                fontSize: '0.8rem',
                                color: '#dc2626',
                                marginBottom: '1rem',
                            }}>
                                {submitError}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                style={{
                                    flex: 1,
                                    padding: '11px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    background: '#fff',
                                    color: '#334155',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    flex: 2,
                                    padding: '11px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: submitting ? '#94a3b8' : '#003566',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.15s ease',
                                }}
                            >
                                {submitting ? 'Membuat order…' : 'Konfirmasi Order'}
                            </button>
                        </div>

                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                            Order masih bisa dibatalkan sebelum seller accept
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

const qtyBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#334155',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
}