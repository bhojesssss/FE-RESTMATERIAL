import { useState } from 'react'
import { motion } from 'framer-motion'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function CreateListingPage() {
  void motion
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <motion.main className="create-shell" {...pageMotion}>
      <div className="create-inner">
        <header className="create-head">
          <span className="section-tag">Sell</span>
          <h1 className="create-title">Create listing</h1>
          <p className="create-sub">
            Placeholder form — fields and copy will be wired when you provide them. Submit is demo-only (no server).
          </p>
        </header>

        <form className="create-form" onSubmit={onSubmit}>
          <label className="create-label">
            Listing title
            <input className="create-input" name="title" type="text" placeholder="e.g. Surplus rebar — Jakarta" />
          </label>

          <label className="create-label">
            Short description
            <textarea className="create-textarea" name="description" rows={4} placeholder="Material condition, quantity context, pickup notes…" />
          </label>

          <div className="create-row">
            <label className="create-label">
              Category
              <select className="create-input" name="category" defaultValue="">
                <option value="" disabled>Select category</option>
                <option>Bricks &amp; Blocks</option>
                <option>Wood &amp; Plywood</option>
                <option>Steel &amp; Iron</option>
                <option>Ceramic &amp; Granite</option>
                <option>Frames &amp; Doors</option>
                <option>Pipes &amp; Installation</option>
              </select>
            </label>
            <label className="create-label">
              City
              <input className="create-input" name="city" type="text" placeholder="City" />
            </label>
          </div>

          <div className="create-row">
            <label className="create-label">
              Price (IDR)
              <input className="create-input" name="price" type="number" min={0} placeholder="0" />
            </label>
            <label className="create-label">
              Volume / quantity
              <input className="create-input" name="volume" type="text" placeholder="e.g. 100 kg" />
            </label>
          </div>

          <label className="create-label">
            Photos
            <input className="create-file" name="photos" type="file" accept="image/*" multiple />
          </label>

          <div className="create-actions">
            <button type="submit" className="auth-btn auth-btn-primary">Save draft (demo)</button>
          </div>

          {submitted ? <p className="create-hint" role="status">Demo: form would submit here.</p> : null}
        </form>
      </div>
    </motion.main>
  )
}
