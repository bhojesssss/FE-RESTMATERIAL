import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { login } from './auth'
import FormInput from '../../components/common/FormInput'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  void motion

  const canSubmit = useMemo(() => email.trim() && password, [email, password])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError('')
    try {
      await login({ email, password })  // FIX: tambah await
      navigate('/profile')
    } catch (err) {
      setError(err?.message || 'Login gagal. Coba lagi.')
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
            <span className="section-tag">Welcome Back</span>
            <h1 className="auth-title">Login</h1>
            <p className="auth-sub">Sign in to access your dashboard and manage listings.</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <FormInput
              label="Email"
              wrapperClass="auth-label"
              inputClass="auth-input"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              wrapperClass="auth-label"
              inputClass="auth-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error ? <div className="auth-error" role="alert">{error}</div> : null}

            <button className="auth-btn auth-btn-primary" type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>

            <div className="auth-foot">
              <span>Don't have an account?</span>
              <Link className="auth-link" to="/register">Register</Link>
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
              The B2B construction material exchange built to reduce waste and maximize value.
            </p>
            <div className="auth-aside-pills">
              <span className="pill">340+ Cities</span>
              <span className="pill">2,400+ Listings</span>
              <span className="pill">Always Free</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.main>
  )
}