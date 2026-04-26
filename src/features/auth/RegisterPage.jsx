import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { register } from './auth'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  void motion

  const passwordsMatch = password && confirm && password === confirm
  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password && passwordsMatch,
    [name, email, password, passwordsMatch]
  )

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError('')
    try {
      await register({ name, email, password })  // FIX: tambah await
      navigate('/profile')
    } catch (err) {
      setError(err?.message || 'Registrasi gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main className="auth-shell" {...pageMotion}>
      <div className="auth-grid">
        <motion.section
          className="auth-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-head">
            <span className="section-tag">New here?</span>
            <h1 className="auth-title">Register</h1>
            <p className="auth-sub">Create an account to start listing your surplus materials.</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <label className="auth-label">
              Name
              <input
                className="auth-input"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Confirm Password
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>

            {/* Passwords don't match warning */}
            {confirm && !passwordsMatch && (
              <div className="auth-error" role="alert">Passwords do not match</div>
            )}

            {/* Server/Supabase error */}
            {error ? <div className="auth-error" role="alert">{error}</div> : null}

            <button
              className="auth-btn auth-btn-primary"
              type="submit"
              disabled={!canSubmit || loading}
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>

            <div className="auth-foot">
              <span>Already have an account?</span>
              <Link className="auth-link" to="/login">Login</Link>
            </div>
          </form>
        </motion.section>

        <motion.aside
          className="auth-aside"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-aside-inner">
            <div className="auth-aside-logo">
              REST<span>MATERIAL</span>
            </div>
            <p className="auth-aside-text">
              Join a marketplace that helps construction teams reuse what still has value.
            </p>
            <div className="auth-aside-pills">
              <span className="pill">Zero Fees</span>
              <span className="pill">Smart Filters</span>
              <span className="pill">Eco Impact</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.main>
  )
}