// src/features/transactions/TransactionDetailPage.jsx
// Route: /transactions/:id
// Covers semua state transitions BE:
//   PENDING → ACCEPTED / REJECTED
//   ACCEPTED → PAID (upload payment proof) / CANCELLED
//   PAID → READY_FOR_HANDOVER
//   READY_FOR_HANDOVER → COMPLETED

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { request, uploadFiles } from '../../services/api'
import { getCachedSession } from '../../features/auth/auth'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_META = {
    PENDING: {
        label: 'Menunggu Konfirmasi',
        color: '#b45309',
        bg: 'rgba(245,158,11,0.1)',
        border: 'rgba(245,158,11,0.3)',
        step: 1,
    },
    ACCEPTED: {
        label: 'Diterima — Tunggu Pembayaran',
        color: '#1d4ed8',
        bg: 'rgba(59,130,246,0.1)',
        border: 'rgba(59,130,246,0.3)',
        step: 2,
    },
    PAID: {
        label: 'Dibayar — Seller Siapkan Barang',
        color: '#0f766e',
        bg: 'rgba(20,184,166,0.1)',
        border: 'rgba(20,184,166,0.3)',
        step: 3,
    },
    READY_FOR_HANDOVER: {
        label: 'Siap Diserahkan',
        color: '#7c3aed',
        bg: 'rgba(124,58,237,0.1)',
        border: 'rgba(124,58,237,0.3)',
        step: 4,
    },
    COMPLETED: {
        label: 'Selesai',
        color: '#15803d',
        bg: 'rgba(34,197,94,0.1)',
        border: 'rgba(34,197,94,0.3)',
        step: 5,
    },
    REJECTED: {
        label: 'Ditolak',
        color: '#dc2626',
        bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.3)',
        step: 0,
    },
    CANCELLED: {
        label: 'Dibatalkan',
        color: '#64748b',
        bg: 'rgba(100,116,139,0.1)',
        border: 'rgba(100,116,139,0.2)',
        step: 0,
    },
}

const STEPS = ['PENDING', 'ACCEPTED', 'PAID', 'READY_FOR_HANDOVER', 'COMPLETED']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatIdr(n) {
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
        }).format(n)
    } catch { return `IDR ${n}` }
}

function formatDate(str) {
    if (!str) return '—'
    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(str))
    } catch { return str }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.PENDING
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '99px',
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
            color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
        }}>
            <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: meta.color, flexShrink: 0,
            }} />
            {meta.label}
        </span>
    )
}

function ProgressStepper({ status }) {
    const isTerminal = ['REJECTED', 'CANCELLED'].includes(status)
    const currentStep = STATUS_META[status]?.step ?? 0

    if (isTerminal) {
        return (
            <div style={{
                padding: '14px 16px', borderRadius: '10px',
                background: STATUS_META[status].bg,
                border: `1px solid ${STATUS_META[status].border}`,
                fontSize: '0.82rem', color: STATUS_META[status].color, fontWeight: 600,
                textAlign: 'center',
            }}>
                Order ini telah {status === 'REJECTED' ? 'ditolak' : 'dibatalkan'}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((step, i) => {
                const meta = STATUS_META[step]
                const isDone = currentStep > meta.step
                const isActive = currentStep === meta.step
                return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDone ? '#003566' : isActive ? '#f5b800' : '#e2e8f0',
                                color: isDone ? '#fff' : isActive ? '#003566' : '#94a3b8',
                                fontSize: isDone ? '0.75rem' : '0.7rem',
                                fontWeight: 700, flexShrink: 0,
                                border: isActive ? '2px solid #003566' : 'none',
                                transition: 'all 0.3s ease',
                            }}>
                                {isDone ? '✓' : i + 1}
                            </div>
                            <div style={{
                                fontSize: '0.6rem', fontWeight: 600, textAlign: 'center',
                                color: isActive ? '#003566' : isDone ? '#64748b' : '#94a3b8',
                                maxWidth: '60px', lineHeight: 1.3,
                            }}>
                                {step === 'PENDING' && 'Pending'}
                                {step === 'ACCEPTED' && 'Accepted'}
                                {step === 'PAID' && 'Paid'}
                                {step === 'READY_FOR_HANDOVER' && 'Ready'}
                                {step === 'COMPLETED' && 'Done'}
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: '2px', margin: '0 4px', marginBottom: '16px',
                                background: isDone ? '#003566' : '#e2e8f0',
                                transition: 'background 0.3s ease',
                            }} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function InfoRow({ label, value }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            gap: '1rem', padding: '10px 0',
            borderBottom: '1px solid #f1f5f9',
        }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', flexShrink: 0, fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 600, textAlign: 'right' }}>{value}</span>
        </div>
    )
}

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionButton({ label, onClick, variant = 'primary', loading, disabled, danger }) {
    const base = {
        padding: '11px 20px', borderRadius: '10px',
        fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
        border: 'none', transition: 'all 0.15s ease',
        opacity: loading || disabled ? 0.6 : 1,
        pointerEvents: loading || disabled ? 'none' : 'auto',
    }
    const styles = {
        primary: { background: '#003566', color: '#fff' },
        outline: { background: '#fff', color: '#003566', border: '1.5px solid #003566' },
        danger: { background: danger ? '#dc2626' : '#fff', color: danger ? '#fff' : '#dc2626', border: danger ? 'none' : '1.5px solid #dc2626' },
        yellow: { background: '#f5b800', color: '#003566' },
    }
    return (
        <button type="button" onClick={onClick} style={{ ...base, ...styles[variant] }}>
            {loading ? 'Loading…' : label}
        </button>
    )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ title, desc, onConfirm, onCancel, danger, reasonLabel }) {
    const [reason, setReason] = useState('')
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,21,46,0.55)',
                backdropFilter: 'blur(4px)', zIndex: 1001,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                    background: '#fff', borderRadius: '14px', padding: '1.5rem',
                    width: '100%', maxWidth: '400px',
                    boxShadow: '0 24px 64px rgba(0,21,46,0.18)',
                }}
            >
                <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#0d1b2a' }}>{title}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</p>

                {reasonLabel && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            {reasonLabel} <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span>
                        </label>
                        <textarea
                            rows={2}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Alasan..."
                            maxLength={200}
                            style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                                resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                            }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button" onClick={onCancel}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '9px',
                            border: '1.5px solid #e2e8f0', background: '#fff',
                            color: '#334155', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        }}
                    >
                        Batal
                    </button>
                    <button
                        type="button" onClick={() => onConfirm(reason)}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                            background: danger ? '#dc2626' : '#003566',
                            color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                        }}
                    >
                        Konfirmasi
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── Payment Upload ───────────────────────────────────────────────────────────

function PaymentUploadPanel({ txId, onSuccess }) {
    const fileRef = useRef(null)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [err, setErr] = useState(null)

    function handleFile(f) {
        if (!f) return
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (!allowed.includes(f.type)) { setErr('Format tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.'); return }
        if (f.size > 5 * 1024 * 1024) { setErr('File terlalu besar. Maksimal 5MB.'); return }
        setFile(f)
        setErr(null)
        if (f.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = e => setPreview(e.target.result)
            reader.readAsDataURL(f)
        } else {
            setPreview(null)
        }
    }

    async function handleUpload() {
        if (!file) { setErr('Pilih file bukti pembayaran dulu.'); return }
        setUploading(true)
        setErr(null)
        try {
            const res = await uploadFiles(`/transactions/${txId}/payment`, [file], 'payment_proof')
            onSuccess(res.transaction)
        } catch (e) {
            setErr(e.message || 'Upload gagal. Coba lagi.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{
            background: '#f8fafc', borderRadius: '12px',
            border: '1.5px dashed #cbd5e1', padding: '1.25rem',
        }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a', marginBottom: '4px' }}>
                Upload Bukti Pembayaran
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                Format: JPG, PNG, WebP, atau PDF. Maks 5MB.
            </div>

            {/* Drop zone */}
            <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
                style={{
                    border: '1.5px dashed #cbd5e1', borderRadius: '10px',
                    padding: '1.5rem', textAlign: 'center',
                    cursor: 'pointer', background: '#fff', marginBottom: '12px',
                    transition: 'border-color 0.15s',
                }}
            >
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                {preview ? (
                    <img src={preview} alt="preview" style={{ maxHeight: '120px', borderRadius: '6px', objectFit: 'contain' }} />
                ) : file ? (
                    <div style={{ fontSize: '0.85rem', color: '#003566', fontWeight: 600 }}>📄 {file.name}</div>
                ) : (
                    <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📎</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Klik atau drag file ke sini</div>
                    </div>
                )}
            </div>

            {err && <div style={{ fontSize: '0.78rem', color: '#dc2626', marginBottom: '8px' }}>{err}</div>}

            <button
                type="button" onClick={handleUpload} disabled={uploading || !file}
                style={{
                    width: '100%', padding: '10px', borderRadius: '9px', border: 'none',
                    background: !file || uploading ? '#94a3b8' : '#003566',
                    color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                    cursor: !file || uploading ? 'not-allowed' : 'pointer',
                }}
            >
                {uploading ? 'Mengupload…' : 'Upload Bukti Bayar'}
            </button>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const pageMotion = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function TransactionDetailPage() {
    void pageMotion
    const { id } = useParams()
    const navigate = useNavigate()
    const session = getCachedSession()

    const [tx, setTx] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(null) // which action is pending
    const [dialog, setDialog] = useState(null) // { type, ... }
    const [actionError, setActionError] = useState(null)

    useEffect(() => {
        setLoading(true)
        request(`/transactions/${id}`)
            .then(res => setTx(res.transaction))
            .catch(err => setError(err.message || 'Gagal memuat transaksi'))
            .finally(() => setLoading(false))
    }, [id])

    // ── Derived state ──
    const myRole = tx?.my_role // 'BUYER' | 'SELLER'
    const status = tx?.status
    const isSeller = myRole === 'SELLER'
    const isBuyer = myRole === 'BUYER'

    // ── Action handlers ──────────────────────────────────────────────────────────

    async function doAction(actionType, endpoint, method = 'PATCH', body = null) {
        setActionLoading(actionType)
        setActionError(null)
        try {
            const opts = { method }
            if (body) opts.body = JSON.stringify(body)
            const res = await request(endpoint, opts)
            // Update tx state dengan data terbaru dari server
            setTx(prev => ({ ...prev, ...res.transaction }))
            setDialog(null)
        } catch (err) {
            setActionError(err.message || 'Aksi gagal. Coba lagi.')
        } finally {
            setActionLoading(null)
        }
    }

    function handleAccept() {
        setDialog({ type: 'accept' })
    }

    function handleReject() {
        setDialog({ type: 'reject' })
    }

    function handleCancel() {
        setDialog({ type: 'cancel' })
    }

    function handleReady() {
        setDialog({ type: 'ready' })
    }

    function handleComplete() {
        setDialog({ type: 'complete' })
    }

    function handlePaymentSuccess(updatedTx) {
        setTx(prev => ({ ...prev, ...updatedTx }))
    }

    // ── Render guards ─────────────────────────────────────────────────────────────

    if (loading) return (
        <motion.main style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...pageMotion}>
            <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏳</div>
                <div>Memuat transaksi…</div>
            </div>
        </motion.main>
    )

    if (error || !tx) return (
        <motion.main style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...pageMotion}>
            <div>
                <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>{error || 'Transaksi tidak ditemukan'}</div>
                <Link to="/marketplace" style={{ color: '#003566', fontSize: '0.875rem' }}>← Kembali ke Marketplace</Link>
            </div>
        </motion.main>
    )

    const listing = tx.listing
    const buyer = tx.buyer
    const seller = tx.seller
    const primaryPhoto = tx.primary_photo || listing?.photos?.find(p => p.is_primary)?.url || null
    const isActive = !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status)

    return (
        <>
            <motion.main
                style={{ background: '#f1f5f9', minHeight: 'calc(100vh - var(--nav-height, 64px))' }}
                {...pageMotion}
            >
                <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.25rem' }}>

                    {/* Back link */}
                    <Link to="/profile" style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1.25rem' }}>
                        ← Kembali ke Dashboard
                    </Link>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
                                Order #{id.slice(0, 8).toUpperCase()}
                            </div>
                            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0d1b2a', letterSpacing: '-0.02em' }}>
                                {listing?.title || 'Detail Transaksi'}
                            </h1>
                            <div style={{ marginTop: '8px' }}>
                                <StatusBadge status={status} />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Dibuat {formatDate(tx.created_at)}
                        </div>
                    </div>

                    {/* Progress stepper */}
                    <div style={{
                        background: '#fff', borderRadius: '14px', padding: '1.25rem 1.5rem',
                        boxShadow: '0 1px 4px rgba(0,21,46,0.06)', marginBottom: '1.25rem',
                    }}>
                        <ProgressStepper status={status} />
                    </div>

                    {/* Action error */}
                    <AnimatePresence>
                        {actionError && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    borderRadius: '10px', padding: '12px 14px',
                                    fontSize: '0.82rem', color: '#dc2626', marginBottom: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}
                            >
                                {actionError}
                                <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>×</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

                        {/* Left column — detail info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Listing info */}
                            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                                    Detail Listing
                                </div>

                                {primaryPhoto && (
                                    <img src={primaryPhoto} alt={listing?.title}
                                        style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                                        onError={e => { e.target.style.display = 'none' }}
                                    />
                                )}

                                <InfoRow label="Material" value={listing?.title || '—'} />
                                <InfoRow label="Kategori" value={typeof listing?.category === 'object' ? listing.category?.name : listing?.category || '—'} />
                                <InfoRow label="Jumlah" value={`${tx.quantity} ${listing?.unit || 'unit'}`} />
                                <InfoRow label="Harga Total" value={<span style={{ color: '#003566', fontWeight: 800 }}>{formatIdr(tx.total_price)}</span>} />
                                <InfoRow label="Berat" value={tx.total_weight_kg ? `${tx.total_weight_kg} kg` : '—'} />
                                <InfoRow label="Metode" value={tx.delivery_method === 'SELF_PICKUP' ? '🏭 Self Pickup' : '🚚 Delivery'} />
                                {tx.delivery_address && <InfoRow label="Alamat" value={tx.delivery_address} />}
                                {tx.buyer_message && <InfoRow label="Pesan" value={tx.buyer_message} />}
                            </div>

                            {/* Timeline */}
                            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                                    Timeline
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { label: 'Order dibuat', time: tx.created_at },
                                        { label: 'Diterima seller', time: tx.accepted_at },
                                        { label: 'Pembayaran diterima', time: tx.paid_at },
                                        { label: 'Selesai', time: tx.completed_at },
                                        { label: 'Dibatalkan', time: tx.cancelled_at },
                                    ].filter(e => e.time).map(e => (
                                        <div key={e.label} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#003566', flexShrink: 0, marginTop: '5px' }} />
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{e.label}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{formatDate(e.time)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CO2 impact — only if completed */}
                            {status === 'COMPLETED' && tx.co2_saved > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #003566, #001f3f)',
                                    borderRadius: '14px', padding: '1.25rem',
                                    color: '#fff',
                                }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                                        🌱 CO₂ Impact
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f5b800', letterSpacing: '-0.02em' }}>
                                        {tx.co2_saved} kg CO₂e
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                        Emisi yang berhasil dicegah melalui reuse material ini
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right column — parties + actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Seller info */}
                            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                                    Seller
                                </div>
                                <UserCard user={seller} highlight={myRole === 'BUYER'} />
                            </div>

                            {/* Buyer info */}
                            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                                    Buyer
                                </div>
                                <UserCard user={buyer} highlight={myRole === 'SELLER'} />
                            </div>

                            {/* Payment proof link */}
                            {tx.payment_proof_url && (
                                <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                                        Bukti Pembayaran
                                    </div>
                                    <a href={tx.payment_proof_url} target="_blank" rel="noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 14px', borderRadius: '8px',
                                            background: 'rgba(0,53,102,0.06)', color: '#003566',
                                            fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none',
                                        }}
                                    >
                                        📎 Lihat Bukti Bayar
                                    </a>
                                </div>
                            )}

                            {/* ── ACTIONS ── */}
                            {isActive && (
                                <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,21,46,0.06)' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                                        Aksi
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                        {/* SELLER: accept/reject when PENDING */}
                                        {isSeller && status === 'PENDING' && (
                                            <>
                                                <ActionButton label="✓ Terima Order" variant="primary" onClick={handleAccept} loading={actionLoading === 'accept'} />
                                                <ActionButton label="✕ Tolak Order" variant="danger" danger onClick={handleReject} loading={actionLoading === 'reject'} />
                                            </>
                                        )}

                                        {/* BUYER: upload payment when ACCEPTED */}
                                        {isBuyer && status === 'ACCEPTED' && (
                                            <PaymentUploadPanel txId={id} onSuccess={handlePaymentSuccess} />
                                        )}

                                        {/* SELLER: mark ready when PAID */}
                                        {isSeller && status === 'PAID' && (
                                            <ActionButton label="📦 Tandai Siap Diserahkan" variant="yellow" onClick={handleReady} loading={actionLoading === 'ready'} />
                                        )}

                                        {/* BUYER: complete when READY_FOR_HANDOVER */}
                                        {isBuyer && status === 'READY_FOR_HANDOVER' && (
                                            <ActionButton label="✓ Konfirmasi Diterima" variant="primary" onClick={handleComplete} loading={actionLoading === 'complete'} />
                                        )}

                                        {/* CANCEL — both parties, only PENDING or ACCEPTED */}
                                        {(isBuyer || isSeller) && ['PENDING', 'ACCEPTED'].includes(status) && (
                                            <ActionButton label="Batalkan Order" variant="danger" onClick={handleCancel} loading={actionLoading === 'cancel'} />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.main>

            {/* ── Confirm Dialogs ── */}
            <AnimatePresence>
                {dialog?.type === 'accept' && (
                    <ConfirmDialog
                        title="Terima Order Ini?"
                        desc="Setelah kamu terima, buyer akan diarahkan untuk melakukan pembayaran."
                        onConfirm={() => doAction('accept', `/transactions/${id}/accept`)}
                        onCancel={() => setDialog(null)}
                    />
                )}

                {dialog?.type === 'reject' && (
                    <ConfirmDialog
                        title="Tolak Order Ini?"
                        desc="Stok akan dikembalikan ke listing dan buyer akan diberitahu."
                        reasonLabel="Alasan penolakan"
                        danger
                        onConfirm={(reason) => doAction('reject', `/transactions/${id}/reject`, 'PATCH', reason ? { reason } : undefined)}
                        onCancel={() => setDialog(null)}
                    />
                )}

                {dialog?.type === 'cancel' && (
                    <ConfirmDialog
                        title="Batalkan Order Ini?"
                        desc="Stok akan dikembalikan. Tindakan ini tidak bisa dibatalkan."
                        reasonLabel="Alasan pembatalan"
                        danger
                        onConfirm={(reason) => doAction('cancel', `/transactions/${id}/cancel`, 'PATCH', reason ? { reason } : undefined)}
                        onCancel={() => setDialog(null)}
                    />
                )}

                {dialog?.type === 'ready' && (
                    <ConfirmDialog
                        title="Tandai Barang Siap?"
                        desc="Buyer akan dikonfirmasi bahwa barang siap diambil/dikirim."
                        onConfirm={() => doAction('ready', `/transactions/${id}/ready`)}
                        onCancel={() => setDialog(null)}
                    />
                )}

                {dialog?.type === 'complete' && (
                    <ConfirmDialog
                        title="Konfirmasi Barang Diterima?"
                        desc="Setelah dikonfirmasi, transaksi akan selesai dan tidak bisa diubah."
                        onConfirm={() => doAction('complete', `/transactions/${id}/complete`)}
                        onCancel={() => setDialog(null)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

function UserCard({ user, highlight }) {
    if (!user) return <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</div>
    const initial = String(user.full_name || user.name || 'U').slice(0, 1).toUpperCase()
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                />
            ) : (
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: highlight ? 'linear-gradient(135deg, #003566, #001f3f)' : '#e2e8f0',
                    color: highlight ? '#f5b800' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
                }}>
                    {initial}
                </div>
            )}
            <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0d1b2a' }}>
                    {user.full_name || user.name}
                </div>
                {user.city && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{user.city}</div>
                )}
            </div>
        </div>
    )
}