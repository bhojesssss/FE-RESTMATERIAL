import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { request } from "../../services/api";
import { getSession, getCachedSession, logout, updateUser } from "../auth/auth";
import { recentListings } from "../../data/profileData";
import { CITIES, LISTINGS } from "../../data/marketplace";
import {
  NavIconDashboard,
  NavIconPlus,
  NavIconChart,
  NavIconUsers,
  NavIconSettings,
  NavIconHelp,
  NavIconLogout,
} from "../../assets/icons/NavIcons";
import {
  MenuIcon,
  SearchIcon,
  MailIcon,
  NotificationIcon,
} from "../../assets/icons/ProfileIcons";
import MetricCard from "../../components/shared/MetricCard";
import { CO2_EMISSION_FACTORS } from "./CreateListingPage";

const pageMotion = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Condition options — sama kayak di CreateListingPage ──────────────────────
const CONDITION_OPTIONS = [
  { label: "New / Surplus", value: "NEW_SURPLUS" },
  { label: "Pre-loved", value: "PRELOVED" },
  { label: "Needs Repair", value: "NEEDS_REPAIR" },
];

const CITY_TO_PROVINCE = {
  Jakarta: "DKI Jakarta",
  Surabaya: "Jawa Timur",
  Bandung: "Jawa Barat",
  Medan: "Sumatera Utara",
  Makassar: "Sulawesi Selatan",
  Semarang: "Jawa Tengah",
  Palembang: "Sumatera Selatan",
  Tangerang: "Banten",
  Depok: "Jawa Barat",
  Bekasi: "Jawa Barat",
};

// ── Status helpers ───────────────────────────────────────────────────────────
function toDisplayStatus(beStatus) {
  switch (beStatus) {
    case "AVAILABLE":
      return "Active";
    case "RESERVED":
      return "Reserved";
    case "SOLD":
      return "Sold";
    case "INACTIVE":
      return "Paused";
    default:
      return beStatus || "Active";
  }
}

function toStatusClass(beStatus) {
  switch (beStatus) {
    case "AVAILABLE":
      return "manage-status--active";
    case "RESERVED":
      return "manage-status--draft";
    case "SOLD":
      return "manage-status--sold";
    case "INACTIVE":
      return "manage-status--draft";
    default:
      return "manage-status--active";
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(() => getCachedSession());
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => ({
    name: session?.full_name || session?.name || "",
    city: session?.city || "",
    phone: session?.phone || "",
  }));
  const [activeView, setActiveView] = useState("overview");

  // ── Edit listing state ────────────────────────────────────────────────────
  // editingListingId: id listing yang sedang di-edit, null = tidak ada
  const [editingListingId, setEditingListingId] = useState(null);
  const [listingEditForm, setListingEditForm] = useState({});
  const [listingEditErrors, setListingEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  // categories untuk dropdown di form edit
  const [categories, setCategories] = useState([]);

  // Listings state
  const [apiListings, setApiListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState({});
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  const [draftListings, setDraftListings] = useState(() => {
    try {
      const draft = localStorage.getItem("rm_listings_draft");
      return draft ? JSON.parse(draft) : [];
    } catch {
      return [];
    }
  });

  void motion;

  // ── 1. Resolve session ───────────────────────────────────────────────────
  useEffect(() => {
    getSession()
      .then((resolved) => {
        if (resolved) {
          setSession(resolved);
          setEditForm({
            name: resolved.full_name || resolved.name || "",
            city: resolved.city || "",
            phone: resolved.phone || "",
          });
        } else {
          navigate("/login", { replace: true });
        }
      })
      .catch(() => navigate("/login", { replace: true }))
      .finally(() => setSessionLoading(false));
  }, [navigate]);

  // ── 2. Load listings ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    setListingsLoading(true);
    request("/listings/me")
      .then((res) => {
        const items = Array.isArray(res?.data) ? res.data : [];
        setApiListings(
          items.map((item) => ({
            ...item,
            name: item.title,
            category: item.category?.name || item.category || "",
            categoryId: item.category?.id || item.category_id || "",
            priceIdr: item.price_per_unit,
            weightKg: item.estimated_weight_kg,
            photos: item.photos || [],
            primaryPhoto:
              item.photos?.find((p) => p.is_primary)?.url ||
              item.photos?.[0]?.url ||
              null,
          })),
        );
      })
      .catch(() => {
        console.warn("GET /listings/me failed — using localStorage fallback");
      })
      .finally(() => setListingsLoading(false));
  }, [session]);

  // ── 3. Load categories (untuk dropdown di form edit) ─────────────────────
  useEffect(() => {
    request("/categories")
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          const mainCats = data.categories.filter((c) => c.parent_id === null);
          setCategories(mainCats.length > 0 ? mainCats : data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allItems = useMemo(() => {
    if (apiListings !== null) return apiListings;
    const myStaticLists = LISTINGS.filter(
      (l) => l.seller?.id === session?.userId,
    );
    return [
      ...(Array.isArray(draftListings) ? draftListings : []),
      ...myStaticLists,
    ];
  }, [apiListings, draftListings, session]);

  const pipelineStats = useMemo(() => {
    if (!session) return { active: 0, reserved: 0, paused: 0, sold: 0, co2: 0 };
    let active = 0,
      reserved = 0,
      paused = 0,
      sold = 0,
      co2 = 0;
    allItems.forEach((item) => {
      const s = item.status;
      if (s === "SOLD" || s === "Sold Out") {
        sold++;
        const factor = CO2_EMISSION_FACTORS[item.category] || 0.5;
        co2 += (item.estimated_weight_kg || item.weightKg || 0) * factor;
      } else if (s === "RESERVED") {
        reserved++;
      } else if (s === "INACTIVE") {
        paused++;
      } else {
        active++;
      }
    });
    return { active, reserved, paused, sold, co2: Math.round(co2) };
  }, [session, allItems]);

  const totalUserListings = allItems.length;
  const displayName = useMemo(
    () => session?.full_name || session?.name || "User",
    [session],
  );
  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/);
    return ((parts[0]?.[0] || "U") + (parts[1]?.[0] || "")).toUpperCase();
  }, [displayName]);

  // ── Handlers: profile ────────────────────────────────────────────────────
  function onLogout() {
    logout();
    setSession(null);
    navigate("/", { replace: true });
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      const nextSession = await updateUser(session.userId, editForm);
      if (nextSession) setSession(nextSession);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  }

  // ── Handlers: listing status ─────────────────────────────────────────────
  async function handlePauseListing(id) {
    if (apiListings === null) return;
    setPendingActions((prev) => ({ ...prev, [id]: "pausing" }));
    try {
      await request(`/listings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "INACTIVE" }),
      });
      setApiListings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "INACTIVE" } : item,
        ),
      );
    } catch (err) {
      alert(`Gagal pause listing: ${err.message}`);
    } finally {
      setPendingActions((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  }

  async function handleActivateListing(id) {
    if (apiListings === null) return;
    setPendingActions((prev) => ({ ...prev, [id]: "activating" }));
    try {
      await request(`/listings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "AVAILABLE" }),
      });
      setApiListings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "AVAILABLE" } : item,
        ),
      );
    } catch (err) {
      alert(`Gagal aktifkan listing: ${err.message}`);
    } finally {
      setPendingActions((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  }

  async function handleDeleteListing(id, title) {
    const confirmed = window.confirm(
      `Hapus listing "${title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;
    if (apiListings === null) {
      const next = draftListings.filter((d) => d.id !== id);
      setDraftListings(next);
      localStorage.setItem("rm_listings_draft", JSON.stringify(next));
      return;
    }
    setPendingActions((prev) => ({ ...prev, [id]: "deleting" }));
    try {
      await request(`/listings/${id}`, { method: "DELETE" });
      setApiListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(`Gagal hapus listing: ${err.message}`);
    } finally {
      setPendingActions((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  }

  // ── Handlers: edit listing ───────────────────────────────────────────────

  // Buka form edit — pre-fill dengan data listing saat ini
  function handleOpenEdit(l) {
    setEditingListingId(l.id);
    setListingEditForm({
      title: l.title || l.name || "",
      description: l.description || "",
      categoryId: l.categoryId || l.category_id || "",
      condition: l.condition || "",
      city: l.city || "",
      address: l.address || "",
      quantity: l.quantity != null ? String(l.quantity) : "",
      unit: l.unit || "kg",
      weightKg:
        l.estimated_weight_kg != null
          ? String(l.estimated_weight_kg)
          : String(l.weightKg || ""),
      priceIdr:
        l.price_per_unit != null
          ? String(l.price_per_unit)
          : String(l.priceIdr || ""),
    });
    setListingEditErrors({});
  }

  function handleCancelEdit() {
    setEditingListingId(null);
    setListingEditForm({});
    setListingEditErrors({});
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setListingEditForm((prev) => ({ ...prev, [name]: value }));
    if (listingEditErrors[name])
      setListingEditErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validateEditForm() {
    const errs = {};
    if (!listingEditForm.title?.trim()) errs.title = "Wajib diisi";
    if (!listingEditForm.categoryId) errs.categoryId = "Pilih kategori";
    if (!listingEditForm.condition) errs.condition = "Pilih kondisi";
    if (!listingEditForm.city) errs.city = "Pilih kota";
    if (!listingEditForm.address?.trim()) errs.address = "Wajib diisi";
    if (!listingEditForm.quantity || parseFloat(listingEditForm.quantity) <= 0)
      errs.quantity = "Masukkan jumlah";
    if (!listingEditForm.weightKg || parseFloat(listingEditForm.weightKg) <= 0)
      errs.weightKg = "Masukkan berat";
    if (
      listingEditForm.priceIdr === "" ||
      parseFloat(listingEditForm.priceIdr) < 0
    )
      errs.priceIdr = "Masukkan harga";
    if (!listingEditForm.description?.trim()) errs.description = "Wajib diisi";
    return errs;
  }

  // PATCH /listings/:id
  async function handleSaveEdit(e) {
    e.preventDefault();
    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) {
      setListingEditErrors(errs);
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        title: listingEditForm.title.trim(),
        description: listingEditForm.description.trim(),
        category_id: listingEditForm.categoryId,
        condition: listingEditForm.condition,
        quantity: parseFloat(listingEditForm.quantity),
        unit: listingEditForm.unit,
        estimated_weight_kg: parseFloat(listingEditForm.weightKg),
        price_per_unit: parseInt(listingEditForm.priceIdr, 10),
        address: listingEditForm.address.trim(),
        city: listingEditForm.city,
        province:
          CITY_TO_PROVINCE[listingEditForm.city] || listingEditForm.city,
      };

      const res = await request(`/listings/${editingListingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updated = res?.listing || res;

      // Update state lokal supaya UI langsung reflect perubahan
      setApiListings((prev) =>
        prev.map((item) =>
          item.id === editingListingId
            ? {
                ...item,
                ...updated,
                name: updated.title || listingEditForm.title,
                category:
                  categories.find((c) => c.id === listingEditForm.categoryId)
                    ?.name || item.category,
                categoryId: listingEditForm.categoryId,
                priceIdr:
                  updated.price_per_unit ??
                  parseInt(listingEditForm.priceIdr, 10),
                weightKg:
                  updated.estimated_weight_kg ??
                  parseFloat(listingEditForm.weightKg),
              }
            : item,
        ),
      );

      handleCancelEdit();
    } catch (err) {
      alert(`Gagal menyimpan perubahan: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  }

  function parsePhotoId(url) {
    if (!url) return null;
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[^/.]+$/, "");
  }

  async function handleDeletePhoto(listingId, photoId) {
    setDeletingPhotoId(photoId);
    try {
      await request(`/listings/${listingId}/photos/${photoId}`, {
        method: "DELETE",
      });
      setApiListings((prev) =>
        prev.map((item) =>
          item.id === listingId
            ? {
                ...item,
                photos: item.photos.filter(
                  (p) => parsePhotoId(p.url) !== photoId,
                ),
              }
            : item,
        ),
      );
    } catch (err) {
      alert(`Gagal hapus foto: ${err.message}`);
    } finally {
      setDeletingPhotoId(null);
    }
  }

  // ── Loading guard ────────────────────────────────────────────────────────
  if (sessionLoading && !session) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#64748b",
        }}
      >
        Loading…
      </div>
    );
  }
  if (!session) return null;

  // ── Render ───────────────────────────────────────────────────────────────
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

      {/* ── Sidebar ── */}
      <aside
        className={`profile-sidebar ${sidebarOpen ? "profile-sidebar--open" : ""}`}
      >
        <Link
          to="/"
          className="profile-sidebar-brand"
          onClick={() => setSidebarOpen(false)}
        >
          REST<span>MATERIAL</span>
        </Link>
        <nav className="profile-side-nav" aria-label="Dashboard menu">
          <div className="profile-nav-label">Menu</div>
          <a
            href="#overview"
            className={`profile-nav-item ${activeView === "overview" ? "profile-nav-item--active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveView("overview");
              setSidebarOpen(false);
            }}
          >
            <NavIconDashboard /> Dashboard
          </a>
          <NavLink
            to="/create-listing"
            className={({ isActive }) =>
              `profile-nav-item ${isActive ? "profile-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <NavIconPlus /> Create listing
          </NavLink>
          <a
            href="#listings"
            className={`profile-nav-item ${activeView === "listings" ? "profile-nav-item--active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveView("listings");
              setSidebarOpen(false);
            }}
          >
            <NavIconChart /> Manage listings
          </a>
          <span className="profile-nav-item profile-nav-item--disabled">
            <NavIconUsers /> Network <small>(soon)</small>
          </span>
          <div className="profile-nav-label" style={{ marginTop: "1.25rem" }}>
            General
          </div>
          <a
            href="#settings"
            className="profile-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <NavIconSettings /> Settings
          </a>
          <a
            href="#help"
            className="profile-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <NavIconHelp /> Help
          </a>
          <button
            type="button"
            className="profile-nav-item profile-nav-item--logout"
            onClick={onLogout}
          >
            <NavIconLogout /> Logout
          </button>
        </nav>
        <div className="profile-promo">
          <div className="profile-promo-title">Your Listings</div>
          <div className="profile-promo-text">{totalUserListings}</div>
          <p className="profile-promo-sub">Materials currently listed</p>
          <button
            type="button"
            className="profile-promo-btn"
            style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem" }}
            onClick={() => {
              setActiveView("listings");
              setSidebarOpen(false);
            }}
          >
            Manage Listings
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`profile-sidebar-overlay ${sidebarOpen ? "profile-sidebar-overlay--visible" : ""}`}
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      {/* ── Main workspace ── */}
      <div className="profile-workspace">
        <header className="profile-topbar">
          <div className="profile-search-wrap">
            <SearchIcon className="profile-search-ico" />
            <input
              type="search"
              className="profile-search"
              placeholder="Search listings, cities, materials…"
              aria-label="Search"
            />
            <span className="profile-search-kbd">⌘ F</span>
          </div>
          <div className="profile-topbar-actions">
            <button
              type="button"
              className="profile-icon-btn"
              aria-label="Messages"
            >
              <MailIcon />
            </button>
            <button
              type="button"
              className="profile-icon-btn"
              aria-label="Notifications"
            >
              <NotificationIcon />
            </button>
            <div className="profile-top-user">
              <div className="profile-top-avatar" aria-hidden>
                {initials}
              </div>
              <div className="profile-top-user-text">
                <div className="profile-top-name">{displayName}</div>
                <div className="profile-top-email">{session.email}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="profile-scroll">
          <AnimatePresence mode="wait">
            {/* ══ OVERVIEW VIEW ══ */}
            {activeView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="profile-page-head"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={fadeUp}>
                    <h1 className="profile-page-title">Dashboard</h1>
                    <p className="profile-page-sub">
                      Plan, list, and move surplus construction materials with
                      ease.
                    </p>
                  </motion.div>
                  <motion.div
                    className="profile-page-actions"
                    variants={fadeUp}
                  >
                    <Link
                      to="/create-listing"
                      className="profile-btn profile-btn--primary"
                    >
                      + Create listing
                    </Link>
                    <Link
                      to="/marketplace"
                      className="profile-btn profile-btn--outline"
                    >
                      Browse marketplace
                    </Link>
                    <Link to="/" className="profile-btn profile-btn--ghost">
                      Back to home
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.section
                  className="profile-metrics"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    {
                      label: "Total listings",
                      value: totalUserListings.toString(),
                      hint: "Across all cities",
                      highlight: true,
                    },
                    {
                      label: "Active",
                      value: pipelineStats.active.toString(),
                      hint: "Visible on marketplace",
                      highlight: false,
                    },
                    {
                      label: "Reserved",
                      value: pipelineStats.reserved.toString(),
                      hint: "Awaiting transaction",
                      highlight: false,
                    },
                    {
                      label: "Sold",
                      value: pipelineStats.sold.toString(),
                      hint: "Converted materials",
                      highlight: false,
                    },
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

                <motion.div
                  className="profile-grid-row profile-grid-row--2"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  <motion.section className="profile-widget" variants={fadeUp}>
                    <div className="profile-widget-head">
                      <h2 className="profile-widget-title">Recent listings</h2>
                      <button
                        type="button"
                        className="profile-widget-link"
                        onClick={() => setActiveView("listings")}
                      >
                        View all
                      </button>
                    </div>
                    {listingsLoading ? (
                      <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                        Loading…
                      </p>
                    ) : allItems.length === 0 ? (
                      <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                        No listings yet.
                      </p>
                    ) : (
                      <ul className="profile-mini-list">
                        {allItems.slice(0, 5).map((item) => (
                          <li key={item.id} className="profile-mini-item">
                            <span
                              className={`profile-mini-dot ${item.status === "SOLD" ? "green" : item.status === "INACTIVE" ? "gray" : "blue"}`}
                              aria-hidden
                            />
                            <div>
                              <div className="profile-mini-title">
                                {item.name || item.title}
                              </div>
                              <div className="profile-mini-meta">
                                {item.category} · {item.city} ·{" "}
                                {toDisplayStatus(item.status)}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.section>

                  <motion.section className="profile-widget" variants={fadeUp}>
                    <div className="profile-widget-head">
                      <h2 className="profile-widget-title">Listing progress</h2>
                    </div>
                    <div className="pipeline-wrap">
                      <div className="pipeline-track">
                        {pipelineStats.active > 0 ||
                        pipelineStats.reserved > 0 ||
                        pipelineStats.sold > 0 ||
                        pipelineStats.paused > 0 ? (
                          <>
                            {pipelineStats.active > 0 && (
                              <div
                                className="pipeline-segment pipeline-segment--active"
                                title="Active"
                                style={{ flex: pipelineStats.active }}
                              />
                            )}
                            {pipelineStats.reserved > 0 && (
                              <div
                                className="pipeline-segment pipeline-segment--draft"
                                title="Reserved"
                                style={{ flex: pipelineStats.reserved }}
                              />
                            )}
                            {pipelineStats.paused > 0 && (
                              <div
                                className="pipeline-segment"
                                title="Paused"
                                style={{
                                  flex: pipelineStats.paused,
                                  background: "rgba(0,53,102,0.12)",
                                }}
                              />
                            )}
                            {pipelineStats.sold > 0 && (
                              <div
                                className="pipeline-segment pipeline-segment--sold"
                                title="Sold"
                                style={{ flex: pipelineStats.sold }}
                              />
                            )}
                          </>
                        ) : (
                          <div
                            className="pipeline-segment"
                            style={{
                              flex: 1,
                              background: "rgba(0, 53, 102, 0.05)",
                            }}
                          />
                        )}
                      </div>
                      <div className="pipeline-labels">
                        {[
                          ["active", "Active"],
                          ["reserved", "Reserved"],
                          ["sold", "Sold"],
                        ].map(([key, label]) => (
                          <div key={key} className="pipeline-stats-item">
                            <div
                              className={`pipeline-legend-dot pipeline-legend-dot--${key === "reserved" ? "draft" : key}`}
                            />
                            <span>{label}</span>
                            <span className="pipeline-stats-val">
                              {pipelineStats[key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>

                  <motion.section
                    className="profile-widget profile-widget--dark"
                    variants={fadeUp}
                  >
                    <div className="profile-impact-label">CO₂ impact</div>
                    <div className="profile-impact-value">
                      {pipelineStats.co2} kg
                    </div>
                    <p className="profile-impact-sub">
                      {pipelineStats.co2 > 0
                        ? "Estimated emissions avoided through reuse on RESTMATERIAL."
                        : "Start selling your surplus materials to build your CO₂ impact!"}
                    </p>
                    <div className="profile-impact-actions">
                      <Link to="/marketplace" className="profile-impact-btn">
                        View marketplace
                      </Link>
                    </div>
                  </motion.section>
                </motion.div>

                {/* Account card */}
                <motion.section
                  className="profile-account-card"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <div
                    className="profile-widget-head"
                    style={{ marginBottom: "1rem" }}
                  >
                    <h2 className="profile-widget-title">Account</h2>
                    {!isEditing && (
                      <button
                        type="button"
                        className="profile-widget-link"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit profile
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <form
                      onSubmit={handleSaveProfile}
                      className="profile-account-form"
                    >
                      <div
                        className="profile-account-grid"
                        style={{ marginBottom: "1rem" }}
                      >
                        <label
                          className="create-label"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          Full name
                          <input
                            className="create-input"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </label>
                        <label className="create-label">
                          City
                          <select
                            className="create-input"
                            value={editForm.city}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select city</option>
                            {CITIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="create-label">
                          WhatsApp number
                          <input
                            className="create-input"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="+62 812 xxxx xxxx"
                          />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="submit"
                          className="profile-btn profile-btn--primary"
                        >
                          Save changes
                        </button>
                        <button
                          type="button"
                          className="profile-btn profile-btn--ghost"
                          onClick={() => {
                            setEditForm({
                              name: session.full_name || session.name || "",
                              city: session.city || "",
                              phone: session.phone || "",
                            });
                            setIsEditing(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-account-grid">
                      {[
                        ["Name", session.full_name || session.name || "-"],
                        ["Email", session.email],
                        ["City", session.city || "-"],
                        ["WhatsApp", session.phone || "-"],
                        ["Role", session.role || "-"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span className="profile-account-k">{k}</span>
                          <div className="profile-account-v">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              </motion.div>
            )}

            {/* ══ MANAGE LISTINGS VIEW ══ */}
            {activeView === "listings" && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="profile-page-head"
                  style={{ marginBottom: "1rem" }}
                >
                  <div>
                    <h1 className="profile-page-title">Manage listings</h1>
                    <p className="profile-page-sub">
                      Edit, pause, re-activate, or delete your material
                      listings.
                    </p>
                  </div>
                  <div className="profile-page-actions">
                    <Link
                      to="/create-listing"
                      className="profile-btn profile-btn--primary"
                    >
                      + New listing
                    </Link>
                    <button
                      type="button"
                      className="profile-btn profile-btn--ghost"
                      onClick={() => setActiveView("overview")}
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                {listingsLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    Loading listings…
                  </div>
                ) : allItems.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    You haven't posted any materials yet.{" "}
                    <Link
                      to="/create-listing"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      Create your first listing
                    </Link>
                  </div>
                ) : (
                  <div className="manage-list-grid">
                    {allItems.map((l) => {
                      const beStatus = l.status;
                      const displayStatus = toDisplayStatus(beStatus);
                      const statusClass = toStatusClass(beStatus);
                      const isPending = !!pendingActions[l.id];
                      const isSold = beStatus === "SOLD";
                      const isInactive = beStatus === "INACTIVE";
                      const isAvailable = beStatus === "AVAILABLE";
                      const isDraft =
                        typeof l.id === "string" && l.id.startsWith("listing-");
                      const isEditOpen = editingListingId === l.id;

                      return (
                        <div key={l.id}>
                          {/* ── Card row ── */}
                          <div
                            className="manage-card"
                            style={{
                              opacity: isPending ? 0.6 : 1,
                              borderBottomLeftRadius: isEditOpen
                                ? 0
                                : undefined,
                              borderBottomRightRadius: isEditOpen
                                ? 0
                                : undefined,
                              borderBottom: isEditOpen ? "none" : undefined,
                            }}
                          >
                            {l.primaryPhoto && (
                              <div
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={l.primaryPhoto}
                                  alt={l.name || l.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            )}

                            <div
                              className="manage-card-info"
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              <div className="manage-card-title">
                                {l.name || l.title}
                              </div>
                              <div className="manage-card-meta">
                                {l.category}
                                {l.city ? ` · ${l.city}` : ""}
                                {l.quantity
                                  ? ` · ${l.quantity} ${l.unit || "kg"}`
                                  : ""}
                              </div>
                            </div>

                            <div className="manage-card-actions">
                              <span className={`manage-status ${statusClass}`}>
                                {isPending
                                  ? pendingActions[l.id] === "deleting"
                                    ? "Deleting…"
                                    : "Updating…"
                                  : displayStatus}
                              </span>

                              {/* ── Edit button — semua listing kecuali SOLD ── */}
                              {!isSold && !isDraft && (
                                <button
                                  type="button"
                                  className="manage-card-btn"
                                  style={{
                                    color: isEditOpen ? "#003566" : undefined,
                                    background: isEditOpen
                                      ? "rgba(0,53,102,0.08)"
                                      : undefined,
                                  }}
                                  onClick={() =>
                                    isEditOpen
                                      ? handleCancelEdit()
                                      : handleOpenEdit(l)
                                  }
                                  disabled={isPending}
                                >
                                  {isEditOpen ? "Cancel" : "Edit"}
                                </button>
                              )}

                              {isAvailable && !isDraft && (
                                <button
                                  type="button"
                                  className="manage-card-btn"
                                  onClick={() => handlePauseListing(l.id)}
                                  disabled={isPending}
                                >
                                  Pause
                                </button>
                              )}
                              {isInactive && (
                                <button
                                  type="button"
                                  className="manage-card-btn"
                                  onClick={() => handleActivateListing(l.id)}
                                  disabled={isPending}
                                >
                                  Re-activate
                                </button>
                              )}
                              {!isSold && (
                                <button
                                  type="button"
                                  className="manage-card-btn"
                                  style={{ color: "#dc2626" }}
                                  onClick={() =>
                                    handleDeleteListing(l.id, l.name || l.title)
                                  }
                                  disabled={isPending}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* ── Inline edit form — expand di bawah card ── */}
                          <AnimatePresence>
                            {isEditOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.25,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ overflow: "hidden" }}
                              >
                                <form
                                  onSubmit={handleSaveEdit}
                                  style={{
                                    background: "rgba(0,53,102,0.03)",
                                    border: "1px solid rgba(0,53,102,0.08)",
                                    borderTop: "none",
                                    borderRadius: "0 0 12px 12px",
                                    padding: "1.25rem 1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 900,
                                      letterSpacing: "0.1em",
                                      textTransform: "uppercase",
                                      color: "rgba(0,29,61,0.45)",
                                      marginBottom: "0.25rem",
                                    }}
                                  >
                                    Edit listing
                                  </div>

                                  {/* ── Foto existing ── */}
                                  {(() => {
                                    const currentListing = apiListings?.find(
                                      (item) => item.id === editingListingId,
                                    );
                                    const photos = currentListing?.photos || [];
                                    if (photos.length === 0) return null;

                                    return (
                                      <div>
                                        <div
                                          style={{
                                            fontSize: "0.72rem",
                                            fontWeight: 900,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            color: "rgba(0,29,61,0.45)",
                                            marginBottom: "0.6rem",
                                          }}
                                        >
                                          Foto saat ini
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "0.6rem",
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          {photos.map((photo) => {
                                            // console.log(
                                            //   "photo object:",
                                            //   JSON.stringify(photo),
                                            // );
                                            return (
                                              <div
                                                key={parsePhotoId(photo.url)}
                                                style={{
                                                  position: "relative",
                                                  width: 72,
                                                  height: 72,
                                                  borderRadius: 8,
                                                  overflow: "hidden",
                                                  border: photo.is_primary
                                                    ? "2px solid #003566"
                                                    : "1px solid #e2e8f0",
                                                  flexShrink: 0,
                                                }}
                                              >
                                                <img
                                                  src={photo.url}
                                                  alt=""
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                  }}
                                                />

                                                {/* Primary badge */}
                                                {photo.is_primary && (
                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      bottom: 0,
                                                      left: 0,
                                                      right: 0,
                                                      background:
                                                        "rgba(0,53,102,0.75)",
                                                      color: "white",
                                                      fontSize: "0.6rem",
                                                      fontWeight: 700,
                                                      textAlign: "center",
                                                      padding: "2px 0",
                                                      letterSpacing: "0.05em",
                                                    }}
                                                  >
                                                    MAIN
                                                  </div>
                                                )}

                                                {/* Tombol hapus */}
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeletePhoto(
                                                      editingListingId,
                                                      parsePhotoId(photo.url),
                                                    )
                                                  }
                                                  disabled={
                                                    deletingPhotoId ===
                                                    parsePhotoId(photo.url)
                                                  }
                                                  style={{
                                                    position: "absolute",
                                                    top: 3,
                                                    right: 3,
                                                    width: 20,
                                                    height: 20,
                                                    background:
                                                      deletingPhotoId ===
                                                      parsePhotoId(photo.url)
                                                        ? "rgba(0,0,0,0.4)"
                                                        : "rgba(0,0,0,0.65)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    fontSize: "0.9rem",
                                                    lineHeight: 1,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: 0,
                                                    transition:
                                                      "background 0.15s",
                                                  }}
                                                  aria-label="Hapus foto"
                                                >
                                                  {deletingPhotoId ===
                                                  parsePhotoId(photo.url)
                                                    ? "…"
                                                    : "×"}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {photos.length === 1 && (
                                          <p
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "#f59e0b",
                                              marginTop: "0.4rem",
                                            }}
                                          >
                                            ⚠ Ini foto terakhir. Hapus akan
                                            membuat listing tanpa foto.
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Title */}
                                  <label className="create-label">
                                    Judul listing
                                    <input
                                      className={`create-input${listingEditErrors.title ? " input-error" : ""}`}
                                      name="title"
                                      value={listingEditForm.title || ""}
                                      onChange={handleEditChange}
                                    />
                                    {listingEditErrors.title && (
                                      <p className="field-error">
                                        {listingEditErrors.title}
                                      </p>
                                    )}
                                  </label>

                                  {/* Description */}
                                  <label className="create-label">
                                    Deskripsi
                                    <textarea
                                      className={`create-textarea${listingEditErrors.description ? " input-error" : ""}`}
                                      name="description"
                                      rows={3}
                                      value={listingEditForm.description || ""}
                                      onChange={handleEditChange}
                                    />
                                    {listingEditErrors.description && (
                                      <p className="field-error">
                                        {listingEditErrors.description}
                                      </p>
                                    )}
                                  </label>

                                  {/* Category + Condition */}
                                  <div className="create-row">
                                    <label className="create-label">
                                      Kategori
                                      <select
                                        className={`create-input${listingEditErrors.categoryId ? " input-error" : ""}`}
                                        name="categoryId"
                                        value={listingEditForm.categoryId || ""}
                                        onChange={handleEditChange}
                                      >
                                        <option value="" disabled>
                                          Pilih kategori
                                        </option>
                                        {categories.map((c) => (
                                          <option key={c.id} value={c.id}>
                                            {c.name}
                                          </option>
                                        ))}
                                      </select>
                                      {listingEditErrors.categoryId && (
                                        <p className="field-error">
                                          {listingEditErrors.categoryId}
                                        </p>
                                      )}
                                    </label>

                                    <label className="create-label">
                                      Kondisi
                                      <select
                                        className={`create-input${listingEditErrors.condition ? " input-error" : ""}`}
                                        name="condition"
                                        value={listingEditForm.condition || ""}
                                        onChange={handleEditChange}
                                      >
                                        <option value="" disabled>
                                          Pilih kondisi
                                        </option>
                                        {CONDITION_OPTIONS.map((o) => (
                                          <option key={o.value} value={o.value}>
                                            {o.label}
                                          </option>
                                        ))}
                                      </select>
                                      {listingEditErrors.condition && (
                                        <p className="field-error">
                                          {listingEditErrors.condition}
                                        </p>
                                      )}
                                    </label>
                                  </div>

                                  {/* City + Address */}
                                  <div className="create-row">
                                    <label className="create-label">
                                      Kota
                                      <select
                                        className={`create-input${listingEditErrors.city ? " input-error" : ""}`}
                                        name="city"
                                        value={listingEditForm.city || ""}
                                        onChange={handleEditChange}
                                      >
                                        <option value="" disabled>
                                          Pilih kota
                                        </option>
                                        {CITIES.map((c) => (
                                          <option key={c} value={c}>
                                            {c}
                                          </option>
                                        ))}
                                      </select>
                                      {listingEditErrors.city && (
                                        <p className="field-error">
                                          {listingEditErrors.city}
                                        </p>
                                      )}
                                    </label>

                                    <label className="create-label">
                                      Alamat
                                      <input
                                        className={`create-input${listingEditErrors.address ? " input-error" : ""}`}
                                        name="address"
                                        value={listingEditForm.address || ""}
                                        onChange={handleEditChange}
                                      />
                                      {listingEditErrors.address && (
                                        <p className="field-error">
                                          {listingEditErrors.address}
                                        </p>
                                      )}
                                    </label>
                                  </div>

                                  {/* Quantity + Unit + Weight */}
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "1fr 1fr 1fr",
                                      gap: "1rem",
                                    }}
                                  >
                                    <label className="create-label">
                                      Jumlah
                                      <input
                                        className={`create-input${listingEditErrors.quantity ? " input-error" : ""}`}
                                        type="number"
                                        name="quantity"
                                        min="0.001"
                                        step="0.001"
                                        value={listingEditForm.quantity || ""}
                                        onChange={handleEditChange}
                                      />
                                      {listingEditErrors.quantity && (
                                        <p className="field-error">
                                          {listingEditErrors.quantity}
                                        </p>
                                      )}
                                    </label>

                                    <label className="create-label">
                                      Unit
                                      <select
                                        className="create-input"
                                        name="unit"
                                        value={listingEditForm.unit || "kg"}
                                        onChange={handleEditChange}
                                      >
                                        {[
                                          "kg",
                                          "pcs",
                                          "m2",
                                          "m3",
                                          "m",
                                          "set",
                                        ].map((u) => (
                                          <option key={u} value={u}>
                                            {u}
                                          </option>
                                        ))}
                                      </select>
                                    </label>

                                    <label className="create-label">
                                      Berat (kg)
                                      <input
                                        className={`create-input${listingEditErrors.weightKg ? " input-error" : ""}`}
                                        type="number"
                                        name="weightKg"
                                        min="0.1"
                                        step="0.1"
                                        value={listingEditForm.weightKg || ""}
                                        onChange={handleEditChange}
                                      />
                                      {listingEditErrors.weightKg && (
                                        <p className="field-error">
                                          {listingEditErrors.weightKg}
                                        </p>
                                      )}
                                    </label>
                                  </div>

                                  {/* Price */}
                                  <label className="create-label">
                                    Harga per unit (IDR)
                                    <input
                                      className={`create-input${listingEditErrors.priceIdr ? " input-error" : ""}`}
                                      type="number"
                                      name="priceIdr"
                                      min="0"
                                      step="1000"
                                      value={listingEditForm.priceIdr || ""}
                                      onChange={handleEditChange}
                                    />
                                    {listingEditErrors.priceIdr && (
                                      <p className="field-error">
                                        {listingEditErrors.priceIdr}
                                      </p>
                                    )}
                                  </label>

                                  {/* Actions */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.75rem",
                                      marginTop: "0.25rem",
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      className="profile-btn profile-btn--primary"
                                      disabled={savingEdit}
                                      style={{ minWidth: 120 }}
                                    >
                                      {savingEdit
                                        ? "Menyimpan…"
                                        : "Simpan perubahan"}
                                    </button>
                                    <button
                                      type="button"
                                      className="profile-btn profile-btn--ghost"
                                      onClick={handleCancelEdit}
                                      disabled={savingEdit}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </form>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  );
}
