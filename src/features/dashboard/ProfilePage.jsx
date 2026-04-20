import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../auth/auth'
import { weekBars, recentListings, activityRows } from '../../data/profileData'

const pageMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

function NavIconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function NavIconMarket() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function NavIconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function NavIconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function NavIconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function NavIconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function NavIconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function NavIconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getSession())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  void motion

  useEffect(() => {
    if (!session) navigate('/login', { replace: true })
  }, [navigate, session])

  const displayName = useMemo(() => session?.name || 'User', [session])
  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/)
    const a = parts[0]?.[0] || 'U'
    const b = parts[1]?.[0] || ''
    return (a + b).toUpperCase()
  }, [displayName])

  function onLogout() {
    logout()
    setSession(null)
    navigate('/', { replace: true })
  }

  if (!session) return null

  return (
    <motion.main className="profile-dashboard" {...pageMotion}>
      <button
        type="button"
        className="profile-sidebar-toggle"
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
      </button>

      <aside className={`profile-sidebar ${sidebarOpen ? 'profile-sidebar--open' : ''}`}>
        <Link to="/" className="profile-sidebar-brand" onClick={() => setSidebarOpen(false)}>
          REST<span>MATERIAL</span>
        </Link>

        <nav className="profile-side-nav" aria-label="Dashboard menu">
          <div className="profile-nav-label">Menu</div>
          <NavLink to="/profile" end className={({ isActive }) => `profile-nav-item ${isActive ? 'profile-nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <NavIconDashboard /> Dashboard
          </NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `profile-nav-item ${isActive ? 'profile-nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <NavIconMarket /> Marketplace
          </NavLink>
          <NavLink to="/create-listing" className={({ isActive }) => `profile-nav-item ${isActive ? 'profile-nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <NavIconPlus /> Create listing
          </NavLink>
          <span className="profile-nav-item profile-nav-item--disabled">
            <NavIconChart /> Analytics <small>(soon)</small>
          </span>
          <span className="profile-nav-item profile-nav-item--disabled">
            <NavIconUsers /> Network <small>(soon)</small>
          </span>

          <div className="profile-nav-label" style={{ marginTop: '1.25rem' }}>General</div>
          <a href="#settings" className="profile-nav-item" onClick={() => setSidebarOpen(false)}>
            <NavIconSettings /> Settings
          </a>
          <a href="#help" className="profile-nav-item" onClick={() => setSidebarOpen(false)}>
            <NavIconHelp /> Help
          </a>
          <button type="button" className="profile-nav-item profile-nav-item--logout" onClick={onLogout}>
            <NavIconLogout /> Logout
          </button>
        </nav>

        <div className="profile-promo">
          <div className="profile-promo-title">List on the go</div>
          <p className="profile-promo-text">Capture surplus materials from the yard — RESTMATERIAL web works on mobile.</p>
          <Link to="/create-listing" className="profile-promo-btn" onClick={() => setSidebarOpen(false)}>New listing</Link>
        </div>
      </aside>

      <button
        type="button"
        className={`profile-sidebar-overlay ${sidebarOpen ? 'profile-sidebar-overlay--visible' : ''}`}
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <div className="profile-workspace">
        <header className="profile-topbar">
          <div className="profile-search-wrap">
            <svg className="profile-search-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="search" className="profile-search" placeholder="Search listings, cities, materials…" aria-label="Search" />
            <span className="profile-search-kbd">⌘ F</span>
          </div>
          <div className="profile-topbar-actions">
            <button type="button" className="profile-icon-btn" aria-label="Messages">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </button>
            <button type="button" className="profile-icon-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </button>
            <div className="profile-top-user">
              <div className="profile-top-avatar" aria-hidden>{initials}</div>
              <div className="profile-top-user-text">
                <div className="profile-top-name">{displayName}</div>
                <div className="profile-top-email">{session.email}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="profile-scroll">
          <motion.div className="profile-page-head" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <h1 className="profile-page-title">Dashboard</h1>
              <p className="profile-page-sub">Plan, list, and move surplus construction materials with ease.</p>
            </motion.div>
            <motion.div className="profile-page-actions" variants={fadeUp}>
              <Link to="/create-listing" className="profile-btn profile-btn--primary">+ Create listing</Link>
              <Link to="/marketplace" className="profile-btn profile-btn--outline">Browse marketplace</Link>
              <Link to="/" className="profile-btn profile-btn--ghost">Back to home</Link>
            </motion.div>
          </motion.div>

          <motion.section className="profile-metrics" variants={stagger} initial="hidden" animate="show">
            {[
              { label: 'Total listings', value: '24', hint: 'Across all cities', highlight: true },
              { label: 'Sold / closed', value: '10', hint: 'vs last month', highlight: false },
              { label: 'Active listings', value: '12', hint: 'Visible on marketplace', highlight: false },
              { label: 'Pending', value: '2', hint: 'Drafts & reviews', highlight: false },
            ].map((m) => (
              <motion.div key={m.label} className={`profile-metric ${m.highlight ? 'profile-metric--accent' : ''}`} variants={fadeUp}>
                <div className="profile-metric-top">
                  <span className="profile-metric-label">{m.label}</span>
                  <span className="profile-metric-arrow" aria-hidden>↗</span>
                </div>
                <div className="profile-metric-value">{m.value}</div>
                <div className="profile-metric-hint">{m.hint}</div>
              </motion.div>
            ))}
          </motion.section>

          <motion.div className="profile-grid-row" variants={stagger} initial="hidden" animate="show">
            <motion.section className="profile-widget" variants={fadeUp}>
              <div className="profile-widget-head">
                <h2 className="profile-widget-title">Listing activity</h2>
                <span className="profile-widget-tag">This week</span>
              </div>
              <div className="profile-chart">
                {weekBars.map((b, i) => (
                  <div key={i} className="profile-chart-col">
                    <div className={`profile-bar ${b.style}`} style={{ height: `${b.h}%` }} />
                    <span className="profile-chart-day">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section className="profile-widget profile-widget--accent-soft" variants={fadeUp}>
              <div className="profile-widget-head">
                <h2 className="profile-widget-title">Reminders</h2>
              </div>
              <p className="profile-remind-title">Complete seller profile</p>
              <p className="profile-remind-desc">Add company name and preferred pickup windows to improve trust.</p>
              <Link to="/profile" className="profile-remind-cta">Update profile</Link>
            </motion.section>

            <motion.section className="profile-widget" variants={fadeUp}>
              <div className="profile-widget-head">
                <h2 className="profile-widget-title">Recent listings</h2>
                <Link to="/marketplace" className="profile-widget-link">+ New</Link>
              </div>
              <ul className="profile-mini-list">
                {recentListings.map((item) => (
                  <li key={item.title} className="profile-mini-item">
                    <span className={`profile-mini-dot ${item.tone}`} aria-hidden />
                    <div>
                      <div className="profile-mini-title">{item.title}</div>
                      <div className="profile-mini-meta">{item.meta}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          </motion.div>

          <motion.div className="profile-grid-row profile-grid-row--2" variants={stagger} initial="hidden" animate="show">
            <motion.section className="profile-widget" variants={fadeUp}>
              <div className="profile-widget-head">
                <h2 className="profile-widget-title">Your activity</h2>
                <button type="button" className="profile-widget-link">+ Add note</button>
              </div>
              <ul className="profile-activity">
                {activityRows.map((row) => (
                  <li key={row.task} className="profile-activity-row">
                    <div className="profile-activity-avatar" aria-hidden>{row.name === 'You' ? initials : 'S'}</div>
                    <div className="profile-activity-main">
                      <div className="profile-activity-name">{row.name}</div>
                      <div className="profile-activity-task">{row.task}</div>
                    </div>
                    <span className={`status-pill ${row.statusClass}`}>{row.status}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section className="profile-widget profile-widget--gauge" variants={fadeUp}>
              <div className="profile-widget-head">
                <h2 className="profile-widget-title">Listing progress</h2>
              </div>
              <div className="profile-gauge-wrap">
                <svg className="profile-gauge-svg" viewBox="0 0 200 110" aria-label="41 percent listings fulfilled">
                  <path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    fill="none"
                    stroke="rgba(0,53,102,0.12)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    pathLength="100"
                  />
                  <path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    fill="none"
                    stroke="var(--bus-yellow)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={59}
                  />
                </svg>
                <div className="profile-gauge-label">41% listings fulfilled</div>
              </div>
              <div className="profile-gauge-legend">
                <span><i className="lg lg--solid" /> Completed</span>
                <span><i className="lg lg--mid" /> Active</span>
                <span><i className="lg lg--stripe" /> Pending</span>
              </div>
            </motion.section>

            <motion.section className="profile-widget profile-widget--dark" variants={fadeUp}>
              <div className="profile-impact-label">CO₂ impact (demo)</div>
              <div className="profile-impact-value">128 kg</div>
              <p className="profile-impact-sub">Estimated emissions avoided this month through reuse on RESTMATERIAL.</p>
              <div className="profile-impact-actions">
                <Link to="/marketplace" className="profile-impact-btn">View marketplace</Link>
              </div>
            </motion.section>
          </motion.div>

          <motion.section className="profile-account-card" variants={fadeUp} initial="hidden" animate="show">
            <h2 className="profile-widget-title">Account</h2>
            <div className="profile-account-grid">
              <div><span className="profile-account-k">Name</span><div className="profile-account-v">{session.name}</div></div>
              <div><span className="profile-account-k">Email</span><div className="profile-account-v">{session.email}</div></div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.main>
  )
}
