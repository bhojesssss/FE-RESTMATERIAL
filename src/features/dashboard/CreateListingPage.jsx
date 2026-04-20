import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

// Emission factors (kg CO2 saved per kg material reused)
// Source: ICE Database v3.0, University of Bath / CIDB Malaysia Embodied Carbon Inventory
const CO2_EMISSION_FACTORS = {
  'Bricks & Blocks': 0.24,
  'Steel & Iron': 1.46,
  'Wood & Plywood': 0.46,
  'Ceramic & Granite': 0.78,
  'Frames & Doors': 0.46,
  'Pipes & Installation': 2.50,
}

const MATERIAL_CATEGORIES = [
  'Bricks & Blocks',
  'Wood & Plywood',
  'Steel & Iron',
  'Ceramic & Granite',
  'Frames & Doors',
  'Pipes & Installation',
]

const CONDITIONS = [
  'New/Surplus',
  'Pre-loved/Good Condition',
  'Needs Repair',
]

// FIX 1: City pakai select supaya konsisten dengan Material Type & Condition
const CITIES = [
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar',
  'Semarang', 'Palembang', 'Tangerang', 'Depok', 'Bekasi',
]

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  condition: '',
  city: '',
  weightKg: '',
  priceIdr: '',
  isFree: false,
  photos: [],
}

function formatIdr(n) {
  if (!n || n === '0' || parseFloat(n) <= 0) return ''
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

// ── Drag & Drop Photo Uploader ──────────────────────────────────────────────
function PhotoUploader({ photos, onChange }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!valid.length) return
    onChange((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const next = valid.filter((f) => !existing.has(`${f.name}-${f.size}`))
      return [...prev, ...next]
    })
  }, [onChange])

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function onDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() { setIsDragging(false) }

  function onInputChange(e) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  function removePhoto(index) {
    onChange((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="photo-uploader">
      {/* Drop zone */}
      <div
        className={`photo-dropzone${isDragging ? ' photo-dropzone--active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload photos"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
        <div className="photo-dropzone-icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="photo-dropzone-text">Drag photos here to upload</p>
        <p className="photo-dropzone-or">— or —</p>
        <button
          type="button"
          className="photo-browse-btn"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        >
          Browse files
        </button>
        <p className="photo-dropzone-hint">PNG, JPG, WEBP supported</p>
      </div>

      {/* FIX 3: Image preview grid */}
      {photos.length > 0 && (
        <motion.div
          className="photo-preview-grid"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence>
            {photos.map((file, i) => (
              <motion.div
                key={`${file.name}-${file.size}`}
                className="photo-preview-item"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="photo-preview-img"
                />
                <button
                  type="button"
                  className="photo-remove-btn"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function CreateListingPage() {
  void motion
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const co2Preview = useMemo(() => {
    const weight = parseFloat(form.weightKg)
    if (!form.category || !weight || weight <= 0) return null
    const factor = CO2_EMISSION_FACTORS[form.category] ?? 0.5
    return Math.round(weight * factor * 10) / 10
  }, [form.category, form.weightKg])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // FIX 2: Kosongkan priceIdr saat isFree dicentang (bukan '0')
      ...(name === 'isFree' && checked ? { priceIdr: '' } : {}),
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handlePhotos(updater) {
    setForm((prev) => ({
      ...prev,
      photos: typeof updater === 'function' ? updater(prev.photos) : updater,
    }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.category) next.category = 'Please select a category'
    if (!form.condition) next.condition = 'Please select a condition'
    if (!form.city) next.city = 'Please select a city'
    if (!form.weightKg || parseFloat(form.weightKg) <= 0) next.weightKg = 'Enter estimated weight in kg'
    if (!form.isFree && (!form.priceIdr || parseFloat(form.priceIdr) < 0)) next.priceIdr = 'Enter a price or mark as free'
    if (!form.description.trim()) next.description = 'Please add a short description'
    return next
  }

  function onSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstKey = Object.keys(validationErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const listing = {
      id: `listing-${Date.now()}`,
      category: form.category,
      name: form.title.trim(),
      city: form.city,
      volume: { value: parseFloat(form.weightKg), unit: 'kg' },
      condition: form.condition,
      status: 'Available',
      priceIdr: form.isFree ? 0 : parseInt(form.priceIdr, 10),
      uploadedAt: new Date().toISOString().slice(0, 10),
      description: form.description.trim(),
      co2SavedKg: co2Preview,
      seller: null,
      images: [],
    }

    // Persist ke localStorage supaya listing baru muncul di marketplace
    const existing = JSON.parse(localStorage.getItem('rm_listings_draft') || '[]')
    localStorage.setItem('rm_listings_draft', JSON.stringify([listing, ...existing]))

    console.log('[CreateListing] Submitted listing (demo):', listing)
    setSubmitted(true)
  }

  // ── Success state ──
  if (submitted) {
    return (
      <motion.main className="create-shell" {...pageMotion}>
        <div className="create-inner">
          <div className="create-success">
            <div className="create-success-icon" aria-hidden="true">✓</div>
            <h2 className="create-success-title">Listing submitted!</h2>
            <p className="create-success-sub">
              Saved to local storage (demo mode). Once the backend is connected, it will appear on the marketplace automatically.
            </p>
            {co2Preview && (
              <div className="carbon-card" style={{ marginTop: '1.5rem' }}>
                <div className="carbon-kicker">Estimated CO₂ Impact</div>
                <div className="carbon-text">
                  This listing could prevent <strong>~{co2Preview} kg CO₂e</strong> from being emitted
                </div>
                <div className="carbon-sub">
                  Based on ICE Database emission factors for {form.category}
                </div>
              </div>
            )}
            <div className="create-actions-stack" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                className="auth-btn auth-btn-primary"
                onClick={() => { setForm(INITIAL_FORM); setSubmitted(false) }}
              >
                Create another listing
              </button>
              <button
                type="button"
                className="auth-btn auth-btn-outline"
                onClick={() => navigate('/marketplace')}
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    )
  }

  // ── Form ──
  return (
    <motion.main className="create-shell" {...pageMotion}>
      <div className="create-inner">
        <header className="create-head">
          <span className="section-tag">Sell</span>
          <h1 className="create-title">Create listing</h1>
          <p className="create-sub">
            List your surplus or salvaged construction materials. All fields marked * are required.
          </p>
        </header>

        <form className="create-form" onSubmit={onSubmit} noValidate>

          {/* Title */}
          <div id="field-title">
            <label className="create-label">
              Listing title *
              <input
                className={`create-input${errors.title ? ' input-error' : ''}`}
                name="title"
                type="text"
                placeholder="e.g. Surplus rebar — Jakarta"
                value={form.title}
                onChange={handleChange}
              />
            </label>
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div id="field-description">
            <label className="create-label">
              Description *
              <textarea
                className={`create-textarea${errors.description ? ' input-error' : ''}`}
                name="description"
                rows={4}
                placeholder="Material condition, quantity context, pickup notes, any damage the buyer should know…"
                value={form.description}
                onChange={handleChange}
              />
            </label>
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          {/* Category + Condition */}
          <div className="create-row">
            <div id="field-category">
              <label className="create-label">
                Material type *
                <select
                  className={`create-input${errors.category ? ' input-error' : ''}`}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select category</option>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              {errors.category && <p className="field-error">{errors.category}</p>}
            </div>

            <div id="field-condition">
              <label className="create-label">
                Condition *
                <select
                  className={`create-input${errors.condition ? ' input-error' : ''}`}
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select condition</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </label>
              {errors.condition && <p className="field-error">{errors.condition}</p>}
            </div>
          </div>

          {/* FIX 1: City select + Weight */}
          <div className="create-row">
            <div id="field-city">
              <label className="create-label">
                City *
                <select
                  className={`create-input${errors.city ? ' input-error' : ''}`}
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              {errors.city && <p className="field-error">{errors.city}</p>}
            </div>

            <div id="field-weightKg">
              <label className="create-label">
                Estimated weight (kg) *
                <input
                  className={`create-input${errors.weightKg ? ' input-error' : ''}`}
                  name="weightKg"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 100"
                  value={form.weightKg}
                  onChange={handleChange}
                />
              </label>
              {errors.weightKg && <p className="field-error">{errors.weightKg}</p>}
            </div>
          </div>

          {/* CO2 Preview live */}
          <AnimatePresence>
            {co2Preview !== null && (
              <motion.div
                className="carbon-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="carbon-kicker">Live CO₂ Saving Estimate</div>
                <div className="carbon-text">
                  Reusing this material prevents <strong>~{co2Preview} kg of CO₂e</strong>
                </div>
                <div className="carbon-sub">
                  Based on {form.weightKg} kg of {form.category} × {CO2_EMISSION_FACTORS[form.category]} kg CO₂/kg (ICE Database, Univ. of Bath)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price — FIX 2: hint hanya muncul kalau bukan free DAN nilai > 0 */}
          <div id="field-priceIdr">
            <label className="create-label">
              Price (IDR) *
              <input
                className={`create-input${errors.priceIdr ? ' input-error' : ''}`}
                name="priceIdr"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 500000"
                value={form.priceIdr}
                onChange={handleChange}
                disabled={form.isFree}
              />
            </label>

            {!form.isFree && form.priceIdr && parseFloat(form.priceIdr) > 0 && (
              <p className="create-hint">{formatIdr(form.priceIdr)}</p>
            )}

            {/* FIX 2: Checkbox sejajar dengan teksnya pakai flexbox */}
            <label className="create-checkbox-label">
              <input
                type="checkbox"
                name="isFree"
                checked={form.isFree}
                onChange={handleChange}
              />
              <span>Free / donate this material</span>
            </label>

            {errors.priceIdr && <p className="field-error">{errors.priceIdr}</p>}
          </div>

          {/* FIX 3: Drag & Drop uploader dengan image preview */}
          <div>
            <div className="create-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Photos</div>
            <PhotoUploader photos={form.photos} onChange={handlePhotos} />
          </div>

          {/* Disclaimer */}
          <div className="create-disclaimer">
            <strong>Note:</strong> Only non-hazardous materials (non-B3) are permitted. Materials containing asbestos,
            lead paint, or other hazardous substances must not be listed.
          </div>

          {/* FIX 4: Full-width stacked buttons */}
          <div className="create-actions-stack">
            <button type="submit" className="auth-btn auth-btn-primary">
              Submit listing
            </button>
            <button
              type="button"
              className="auth-btn auth-btn-outline"
              onClick={() => navigate('/marketplace')}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </motion.main>
  )
}
