import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSession, logout, updateUser } from '../auth/auth'
import { recentListings } from '../../data/profileData'
import { CITIES, LISTINGS } from '../../data/marketplace'
import { NavIconDashboard, NavIconMarket, NavIconPlus, NavIconChart, NavIconUsers, NavIconSettings, NavIconHelp, NavIconLogout } from '../../assets/icons/NavIcons'
import { MenuIcon, SearchIcon, MailIcon, NotificationIcon } from '../../assets/icons/ProfileIcons'
import MetricCard from '../../components/shared/MetricCard'
import { CO2_EMISSION_FACTORS } from './CreateListingPage'


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
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(() => ({
    name: session?.name || '',
    city: session?.city || '',
    phone: session?.phone || ''
  }))
  const [activeView, setActiveView] = useState('overview')
  const [soldIds, setSoldIds] = useState(() => JSON.parse(localStorage.getItem('rm_sold_ids') || '[]'))
  const [draftListings, setDraftListings] = useState(() => {
    try {
      const draft = localStorage.getItem('rm_listings_draft')
      return draft ? JSON.parse(draft) : []
    } catch { return [] }
  })
  void motion

  useEffect(() => {
    if (!session) navigate('/login', { replace: true })
  }, [navigate, session])

  const pipelineStats = useMemo(() => {
    if (!session) return { drafts: 0, active: 0, sold: 0, co2: 0 }
    
    let drafts = 0
    let active = 0
    let sold = 0
    let co2 = 0

    const myStaticLists = LISTINGS.filter(l => l.seller?.id === session.userId)
    const allItems = [...(Array.isArray(draftListings) ? draftListings : []), ...myStaticLists]

    allItems.forEach(item => {
      const isSold = item.status?.startsWith('Sold') || soldIds.includes(item.id)
      if (isSold) {
        sold++
        const factor = CO2_EMISSION_FACTORS[item.category] || 0.5
        co2 += (item.volume?.value || 0) * factor
      } else if (item.id?.toString().startsWith('listing-')) {
        drafts++
      } else if (item.status === 'Available') {
        active++
      }
    })
    
    return { drafts, active, sold, co2: Math.round(co2) }
  }, [session, draftListings, soldIds])

  const totalUserListings = pipelineStats.drafts + pipelineStats.active + pipelineStats.sold

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

  function handleSaveProfile(e) {
    e.preventDefault()
    try {
      const nextSession = updateUser(session.userId, editForm)
      if (nextSession) setSession(nextSession)
      setIsEditing(false)
    } catch (err) {
      alert(err.message)
    }
  }

  function handleMarkAsSold(id) {
    const draftIdx = Array.isArray(draftListings) ? draftListings.findIndex(d => d.id === id) : -1
    if (draftIdx >= 0) {
      const nextDrafts = [...draftListings]
      nextDrafts[draftIdx] = { ...nextDrafts[draftIdx], status: 'Sold Out' }
      setDraftListings(nextDrafts)
      localStorage.setItem('rm_listings_draft', JSON.stringify(nextDrafts))
    } else {
      if (!soldIds.includes(id)) {
        const nextSoldIds = [...soldIds, id]
        setSoldIds(nextSoldIds)
        localStorage.setItem('rm_sold_ids', JSON.stringify(nextSoldIds))
      }
    }
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
          <a href="#overview" className={`profile-nav-item ${activeView === 'overview' ? 'profile-nav-item--active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('overview'); setSidebarOpen(false); }}>
            <NavIconDashboard /> Dashboard
          </a>
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
          <div className="profile-promo-title">Your Listings</div>
          <div className="profile-promo-text">{totalUserListings}</div>
          <p className="profile-promo-sub">Materials currently listed</p>
          <button type="button" className="profile-promo-btn" style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => { setActiveView('listings'); setSidebarOpen(false); }}>Manage Listings</button>
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
          <AnimatePresence mode="wait">
            {activeView === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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
                    { label: 'Total listings', value: totalUserListings.toString(), hint: 'Across all cities', highlight: true },
                    { label: 'Sold / closed', value: pipelineStats.sold.toString(), hint: 'Converted materials', highlight: false },
                    { label: 'Active listings', value: pipelineStats.active.toString(), hint: 'Visible on marketplace', highlight: false },
                    { label: 'Pending', value: pipelineStats.drafts.toString(), hint: 'Drafts & reviews', highlight: false },
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

                <motion.div className="profile-grid-row profile-grid-row--2" variants={stagger} initial="hidden" animate="show">
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

                  <motion.section className="profile-widget" variants={fadeUp}>
                    <div className="profile-widget-head">
                      <h2 className="profile-widget-title">Listing progress</h2>
                    </div>
                    <div className="pipeline-wrap">
                      <div className="pipeline-track">
                        {(pipelineStats.drafts > 0 || pipelineStats.active > 0 || pipelineStats.sold > 0) ? (
                          <>
                            {pipelineStats.drafts > 0 && <div className="pipeline-segment pipeline-segment--draft" title="Draft" style={{ flex: pipelineStats.drafts }} />}
                            {pipelineStats.active > 0 && <div className="pipeline-segment pipeline-segment--active" title="Active" style={{ flex: pipelineStats.active }} />}
                            {pipelineStats.sold > 0 && <div className="pipeline-segment pipeline-segment--sold" title="Sold" style={{ flex: pipelineStats.sold }} />}
                          </>
                        ) : (
                          <div className="pipeline-segment" style={{ flex: 1, background: 'rgba(0, 53, 102, 0.05)' }} />
                        )}
                      </div>
                      
                      <div className="pipeline-labels">
                        <div className="pipeline-stats-item">
                          <div className="pipeline-legend-dot pipeline-legend-dot--draft" />
                          <span>Draft</span>
                          <span className="pipeline-stats-val">{pipelineStats.drafts}</span>
                        </div>
                        <div className="pipeline-stats-item">
                          <div className="pipeline-legend-dot pipeline-legend-dot--active" />
                          <span>Active</span>
                          <span className="pipeline-stats-val">{pipelineStats.active}</span>
                        </div>
                        <div className="pipeline-stats-item">
                          <div className="pipeline-legend-dot pipeline-legend-dot--sold" />
                          <span>Sold</span>
                          <span className="pipeline-stats-val">{pipelineStats.sold}</span>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  <motion.section className="profile-widget profile-widget--dark" variants={fadeUp}>
                    <div className="profile-impact-label">CO₂ impact</div>
                    <div className="profile-impact-value">{pipelineStats.co2} kg</div>
                    <p className="profile-impact-sub">
                      {pipelineStats.co2 > 0 
                        ? "Estimated emissions avoided this month through reuse on RESTMATERIAL." 
                        : "Start selling your surplus materials to build your CO₂ impact!"}
                    </p>
                    <div className="profile-impact-actions">
                      <Link to="/marketplace" className="profile-impact-btn">View marketplace</Link>
                    </div>
                  </motion.section>
                </motion.div>

                <motion.section className="profile-account-card" variants={fadeUp} initial="hidden" animate="show">
                  <div className="profile-widget-head" style={{ marginBottom: '1rem' }}>
                    <h2 className="profile-widget-title">Account</h2>
                    {!isEditing && (
                      <button type="button" className="profile-widget-link" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="profile-account-form">
                      <div className="profile-account-grid" style={{ marginBottom: '1rem' }}>
                        <label className="create-label" style={{ gridColumn: '1 / -1' }}>
                          Full Name
                          <input className="create-input" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} required />
                        </label>
                        <label className="create-label">
                          City
                          <select className="create-input" value={editForm.city} onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))} required>
                            <option value="" disabled>Select city</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </label>
                        <label className="create-label">
                          WhatsApp Number
                          <input className="create-input" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} required />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="profile-btn profile-btn--primary">Save Changes</button>
                        <button type="button" className="profile-btn profile-btn--ghost" onClick={() => {
                          setEditForm({ name: session.name || '', city: session.city || '', phone: session.phone || '' })
                          setIsEditing(false)
                        }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-account-grid">
                      <div><span className="profile-account-k">Name</span><div className="profile-account-v">{session.name}</div></div>
                      <div><span className="profile-account-k">Email</span><div className="profile-account-v">{session.email}</div></div>
                      <div><span className="profile-account-k">City</span><div className="profile-account-v">{session.city || '-'}</div></div>
                      <div><span className="profile-account-k">WhatsApp</span><div className="profile-account-v">{session.phone || '-'}</div></div>
                    </div>
                  )}
                </motion.section>
              </motion.div>
            ) : (
              <motion.div key="listings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className="profile-page-head" style={{ marginBottom: '1rem' }}>
                  <div>
                    <h1 className="profile-page-title">Manage Listings</h1>
                    <p className="profile-page-sub">View and update the status of your materials.</p>
                  </div>
                  <div className="profile-page-actions">
                    <button type="button" className="profile-btn profile-btn--ghost" onClick={() => setActiveView('overview')}>← Back to Dashboard</button>
                  </div>
                </div>

                <div className="manage-list-grid">
                  {[...(Array.isArray(draftListings) ? draftListings : [])].map(l => (
                    <div className="manage-card" key={l.id}>
                      <div className="manage-card-info">
                        <div className="manage-card-title">{l.name}</div>
                        <div className="manage-card-meta">{l.category} • {l.volume?.value} {l.volume?.unit}</div>
                      </div>
                      <div className="manage-card-actions">
                        <span className={`manage-status ${l.status === 'Sold Out' ? 'manage-status--sold' : 'manage-status--draft'}`}>
                          {l.status === 'Sold Out' ? 'Sold' : 'Draft'}
                        </span>
                        {l.status !== 'Sold Out' && (
                          <button type="button" className="manage-card-btn" onClick={() => handleMarkAsSold(l.id)}>
                            Mark as Sold
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {LISTINGS.filter(l => l.seller?.id === session.userId).map(l => {
                    const isSold = l.status?.startsWith('Sold') || soldIds.includes(l.id)
                    return (
                      <div className="manage-card" key={l.id}>
                        <div className="manage-card-info">
                          <div className="manage-card-title">{l.name}</div>
                          <div className="manage-card-meta">{l.category} • {l.volume?.value} {l.volume?.unit}</div>
                        </div>
                        <div className="manage-card-actions">
                          <span className={`manage-status ${isSold ? 'manage-status--sold' : 'manage-status--active'}`}>
                            {isSold ? 'Sold' : 'Active'}
                          </span>
                          {!isSold && (
                            <button type="button" className="manage-card-btn" onClick={() => handleMarkAsSold(l.id)}>
                              Mark as Sold
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {(totalUserListings === 0) && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      You haven't posted any materials yet.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  )
}
