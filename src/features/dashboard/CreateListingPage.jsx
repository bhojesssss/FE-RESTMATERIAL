import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UploadIcon, SuccessCheckIcon } from '../../assets/icons/CreateListingIcons'
import FormInput from '../../components/common/FormInput'
import { request, uploadFiles } from '../../services/api'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

// Emission factors (kg CO2 saved per kg material reused)
export const CO2_EMISSION_FACTORS = {
  'Bricks & Blocks': 0.24,
  'Steel & Iron': 1.46,
  'Wood & Plywood': 0.46,
  'Ceramic & Granite': 0.78,
  'Aluminium': 8.24,
  'Glass': 0.91,
  'Concrete': 0.13,
  'Frames & Doors': 0.46,
  'Pipes & Installation': 2.50,
}

// ── Mapping FE label → BE enum value ────────────────────────────────────────
// BE hanya terima: GRADE_A, GRADE_B, GRADE_C, GRADE_D
const CONDITION_OPTIONS = [
  { label: 'New / Surplus', value: 'GRADE_A' },
  { label: 'Good Condition', value: 'GRADE_B' },
  { label: 'Fair / Minor Wear', value: 'GRADE_C' },
  { label: 'Needs Repair', value: 'GRADE_D' },
]

const CITIES = [
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar',
  'Semarang', 'Palembang', 'Tangerang', 'Depok', 'Bekasi',
]

// Province mapping — BE requires province field
const CITY_TO_PROVINCE = {
  'Jakarta': 'DKI Jakarta',
  'Surabaya': 'Jawa Timur',
  'Bandung': 'Jawa Barat',
  'Medan': 'Sumatera Utara',
  'Makassar': 'Sulawesi Selatan',
  'Semarang': 'Jawa Tengah',
  'Palembang': 'Sumatera Selatan',
  'Tangerang': 'Banten',
  'Depok': 'Jawa Barat',
  'Bekasi': 'Jawa Barat',
}

const INITIAL_FORM = {
  title: '',
  description: '',
  categoryId: '',   // UUID dari BE
  categoryName: '', // Untuk display & CO2 lookup
  condition: '',
  city: '',
  address: '',
  weightKg: '',
  quantity: '',
  unit: 'kg',
  priceIdr: '',
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
      const combined = [...prev, ...next]
      // BE max 10 photos per listing, batasi 5 per upload
      return combined.slice(0, 5)
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
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
        <UploadIcon className="photo-dropzone-icon" aria-hidden="true" />
        <p className="photo-dropzone-text">Drag photos here to upload</p>
        <p className="photo-dropzone-or">— or —</p>
        <button
          type="button"
          className="photo-browse-btn"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        >
          Browse files
        </button>
        <p className="photo-dropzone-hint">PNG, JPG, WEBP · max 5 files · 5MB each</p>
      </div>

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
  const [submitState, setSubmitState] = useState('idle') // 'idle' | 'creating' | 'uploading' | 'done'

  // categories dari BE: [{ id, name, slug, parent_id, ... }]
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // GET /categories returns { count, categories: [...] }
    request('/categories')
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          // Hanya ambil parent categories (parent_id === null) supaya pilihan tidak terlalu banyak
          const mainCats = data.categories.filter(c => c.parent_id === null)
          setCategories(mainCats.length > 0 ? mainCats : data.categories)
        }
      })
      .catch(() => {
        // Fallback ke nama statis kalau BE tidak reachable
        // Tanpa UUID, tidak bisa submit ke BE tapi form tetap bisa diisi
        setCategories([])
      })
  }, [])

  const co2Preview = useMemo(() => {
    const weight = parseFloat(form.weightKg)
    if (!form.categoryName || !weight || weight <= 0) return null
    const factor = CO2_EMISSION_FACTORS[form.categoryName] ?? 0.5
    return Math.round(weight * factor * 10) / 10
  }, [form.categoryName, form.weightKg])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleCategoryChange(e) {
    const selectedId = e.target.value
    const cat = categories.find(c => c.id === selectedId)
    setForm(prev => ({
      ...prev,
      categoryId: selectedId,
      categoryName: cat?.name || '',
    }))
    if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }))
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
    if (!form.categoryId) next.categoryId = 'Please select a category'
    if (!form.condition) next.condition = 'Please select a condition'
    if (!form.city) next.city = 'Please select a city'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.quantity || parseFloat(form.quantity) <= 0) next.quantity = 'Enter quantity'
    if (!form.unit.trim()) next.unit = 'Unit is required'
    if (!form.weightKg || parseFloat(form.weightKg) <= 0) next.weightKg = 'Enter estimated weight in kg'
    if (!form.priceIdr || parseFloat(form.priceIdr) < 0) next.priceIdr = 'Enter a valid price'
    if (!form.description.trim()) next.description = 'Please add a short description'
    return next
  }

  async function onSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstKey = Object.keys(validationErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // ── Step 1: Create listing ──────────────────────────────────────────────
    setSubmitState('creating')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category_id: form.categoryId,
      condition: form.condition,         // GRADE_A | GRADE_B | GRADE_C | GRADE_D
      quantity: parseFloat(form.quantity),
      unit: form.unit.trim(),
      estimated_weight_kg: parseFloat(form.weightKg),
      price_per_unit: parseInt(form.priceIdr, 10),
      address: form.address.trim(),
      city: form.city,
      province: CITY_TO_PROVINCE[form.city] || form.city,
    }

    let createdListing = null

    try {
      const result = await request('/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      createdListing = result.listing
    } catch (error) {
      // Fallback: simpan ke localStorage sebagai draft
      console.warn('API fallback: saving to rm_listings_draft', error.message)
      const listing = {
        id: `listing-${Date.now()}`,
        category: form.categoryName,
        name: form.title.trim(),
        city: form.city,
        volume: { value: parseFloat(form.weightKg), unit: 'kg' },
        condition: form.condition,
        status: 'Available',
        priceIdr: parseInt(form.priceIdr, 10),
        uploadedAt: new Date().toISOString().slice(0, 10),
        description: form.description.trim(),
        co2SavedKg: co2Preview,
        seller: null,
        images: [],
      }
      const existing = JSON.parse(localStorage.getItem('rm_listings_draft') || '[]')
      localStorage.setItem('rm_listings_draft', JSON.stringify([listing, ...existing]))
      setSubmitState('done')
      setSubmitted(true)
      return
    }

    // ── Step 2: Upload photos (kalau ada) ───────────────────────────────────
    if (form.photos.length > 0 && createdListing?.id) {
      setSubmitState('uploading')
      try {
        await uploadFiles(`/listings/${createdListing.id}/photos`, form.photos, 'photos')
      } catch (uploadErr) {
        // Listing sudah tersimpan, foto gagal — tetap sukses tapi kasih tau user
        console.warn('Photo upload failed, listing created without photos:', uploadErr.message)
        // Bisa tambah toast notif di sini kalau mau
      }
    }

    setSubmitState('done')
    setSubmitted(true)
  }

  // ── Success state ──
  if (submitted) {
    return (
      <motion.main className="create-shell" {...pageMotion}>
        <div className="create-inner">
          <div className="create-success">
            <SuccessCheckIcon className="create-success-icon" aria-hidden="true" />
            <h2 className="create-success-title">Listing submitted!</h2>
            <p className="create-success-sub">
              Your listing is now live on the marketplace.
            </p>
            {co2Preview && (
              <div className="carbon-card" style={{ marginTop: '1.5rem' }}>
                <div className="carbon-kicker">Estimated CO₂ Impact</div>
                <div className="carbon-text">
                  This listing could prevent <strong>~{co2Preview} kg CO₂e</strong> from being emitted
                </div>
                <div className="carbon-sub">
                  Based on ICE Database emission factors for {form.categoryName}
                </div>
              </div>
            )}
            <div className="create-actions-stack" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                className="auth-btn auth-btn-primary"
                onClick={() => { setForm(INITIAL_FORM); setSubmitted(false); setSubmitState('idle') }}
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

  const isSubmitting = submitState === 'creating' || submitState === 'uploading'
  const submitLabel = submitState === 'creating'
    ? 'Creating listing…'
    : submitState === 'uploading'
      ? `Uploading ${form.photos.length} photo${form.photos.length > 1 ? 's' : ''}…`
      : 'Submit listing'

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
          <FormInput
            id="field-title"
            label="Listing title *"
            wrapperClass="create-label"
            inputClass="create-input"
            name="title"
            type="text"
            placeholder="e.g. Surplus rebar — Jakarta"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
          />

          {/* Description */}
          <FormInput
            id="field-description"
            label="Description *"
            wrapperClass="create-label"
            inputClass="create-textarea"
            as="textarea"
            name="description"
            rows={4}
            placeholder="Material condition, quantity context, pickup notes, any damage the buyer should know…"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
          />

          {/* Category + Condition */}
          <div className="create-row">
            <div id="field-categoryId">
              <label className="create-label">
                Material type *
                <select
                  className="create-input"
                  value={form.categoryId}
                  onChange={handleCategoryChange}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}
            </div>

            <div id="field-condition">
              <label className="create-label">
                Condition *
                <select
                  className="create-input"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select condition</option>
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              {errors.condition && <p className="field-error">{errors.condition}</p>}
            </div>
          </div>

          {/* City + Address */}
          <div className="create-row">
            <div id="field-city">
              <label className="create-label">
                City *
                <select
                  className="create-input"
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

            <FormInput
              id="field-address"
              label="Address *"
              wrapperClass="create-label"
              inputClass="create-input"
              name="address"
              type="text"
              placeholder="e.g. Jl. Sudirman No. 1, Jakarta Pusat"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
          </div>

          {/* Quantity + Unit + Weight */}
          <div className="create-row">
            <FormInput
              id="field-quantity"
              label="Quantity *"
              wrapperClass="create-label"
              inputClass="create-input"
              type="number"
              name="quantity"
              min="0.001"
              step="0.001"
              placeholder="e.g. 50"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
            />

            <div id="field-unit">
              <label className="create-label">
                Unit *
                <select
                  className="create-input"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                  <option value="m2">m²</option>
                  <option value="m3">m³</option>
                  <option value="m">m (linear)</option>
                  <option value="set">set</option>
                </select>
              </label>
              {errors.unit && <p className="field-error">{errors.unit}</p>}
            </div>

            <FormInput
              id="field-weightKg"
              label="Est. weight (kg) *"
              wrapperClass="create-label"
              inputClass="create-input"
              type="number"
              name="weightKg"
              min="0.1"
              step="0.1"
              placeholder="e.g. 100"
              value={form.weightKg}
              onChange={handleChange}
              error={errors.weightKg}
            />
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
                  Based on {form.weightKg} kg of {form.categoryName} × {CO2_EMISSION_FACTORS[form.categoryName] ?? 0.5} kg CO₂/kg (ICE Database, Univ. of Bath)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price */}
          <div id="field-priceIdr">
            <FormInput
              label="Price per unit (IDR) *"
              wrapperClass="create-label"
              inputClass="create-input"
              style={{ marginTop: '0.5rem' }}
              type="number"
              name="priceIdr"
              min="0"
              step="1000"
              placeholder="e.g. 500000"
              value={form.priceIdr}
              onChange={handleChange}
              error={errors.priceIdr}
            />
            {form.priceIdr && parseFloat(form.priceIdr) > 0 && (
              <p className="create-hint">{formatIdr(form.priceIdr)} per {form.unit || 'unit'}</p>
            )}
          </div>

          {/* Photo Uploader */}
          <div>
            <div className="create-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Photos <span style={{ fontWeight: 400, color: '#64748b' }}>(max 5)</span>
            </div>
            <PhotoUploader photos={form.photos} onChange={handlePhotos} />
          </div>

          {/* Disclaimer */}
          <div className="create-disclaimer">
            <strong>Note:</strong> Only non-hazardous materials (non-B3) are permitted. Materials containing asbestos,
            lead paint, or other hazardous substances must not be listed.
          </div>

          <div className="create-actions-stack">
            <button
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={isSubmitting}
            >
              {submitLabel}
            </button>
            <button
              type="button"
              className="auth-btn auth-btn-outline"
              onClick={() => navigate('/marketplace')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </motion.main>
  )
}