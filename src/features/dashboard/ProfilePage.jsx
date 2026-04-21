import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../auth/auth'
import { weekBars, recentListings, activityRows } from '../../data/profileData'
import { NavIconDashboard, NavIconMarket, NavIconPlus, NavIconChart, NavIconUsers, NavIconSettings, NavIconHelp, NavIconLogout } from '../../assets/icons/NavIcons'
import { MenuIcon, SearchIcon, MailIcon, NotificationIcon, GaugeIcon } from '../../assets/icons/ProfileIcons'
import MetricCard from '../../components/shared/MetricCard'


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
        <MenuIcon />
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
            <SearchIcon className="profile-search-ico" />
            <input type="search" className="profile-search" placeholder="Search listings, cities, materials…" aria-label="Search" />
            <span className="profile-search-kbd">⌘ F</span>
          </div>
          <div className="profile-topbar-actions">
            <button type="button" className="profile-icon-btn" aria-label="Messages">
              <MailIcon />
            </button>
            <button type="button" className="profile-icon-btn" aria-label="Notifications">
              <NotificationIcon />
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
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                hint={m.hint}
                highlight={m.highlight}
                variants={fadeUp}
              />
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
                <GaugeIcon className="profile-gauge-svg" />
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
