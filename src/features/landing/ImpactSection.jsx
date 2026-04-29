import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { request } from "../../services/api";

const CATEGORY_COLORS = [
  "#059669",
  "#FFC300",
  "#003566",
  "#001D3D",
  "#94a3b8",
  "#F59E0B",
];

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function ImpactSection() {
  const [platformData, setPlatformData] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Ambil data dari 2 endpoint secara paralel
    Promise.all([
      request("/impact/platform"),
      request("/impact/breakdown")
    ])
      .then(([platformRes, breakdownRes]) => {
        setPlatformData(platformRes);
        setBreakdownData(breakdownRes);
      })
      .catch((err) => {
        console.error("Impact Fetch Error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Loading & Error Guards ───
  if (loading) return (
    <section className="impact-section" style={{ padding: "6rem 6%", textAlign: "center" }}>
      <div style={{ color: "#94a3b8" }}>Loading real-time impact data…</div>
    </section>
  );

  if (error || !platformData) return null; // Atau tampilkan pesan error rapi

  const { stats, equivalents } = platformData;
  const breakdownList = breakdownData?.breakdown || [];

  return (
    <section className="impact-section" style={{ padding: "6rem 6%", background: "linear-gradient(180deg, var(--white), var(--cream))" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-tag" style={{ margin: "0 auto", display: "inline-block" }}>Public Impact Dashboard</span>
          <h2 className="section-heading" style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", color: "var(--oxford)", marginTop: "1rem" }}>
            Real-time Environmental Impact
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem" }}>Based on official transaction data and ICE Database v3.0</p>
        </div>

        {/* ── Summary Cards (Data dari /platform) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "CO₂ Saved", value: `${formatNumber(stats.total_co2_saved)} kg`, color: "#059669" },
            { label: "Materials Saved", value: `${formatNumber(stats.total_kg_saved)} kg`, color: "#003566" },
            { label: "Transactions", value: formatNumber(stats.total_transactions), color: "#FFC300" },
            { label: "Active Sellers", value: formatNumber(stats.total_users), color: "#001D3D" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem 1.25rem", border: "1px solid rgba(0,53,102,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginTop: "0.35rem" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── Equivalents Banner ── */}
        <div style={{ background: "linear-gradient(135deg, #003566, #001D3D)", borderRadius: "16px", padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#FFC300" }}>{formatNumber(equivalents.car_km_avoided)} km</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>Driving distance avoided</div>
          </div>
          <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.15)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#8BC34A" }}>{formatNumber(equivalents.trees_planted_equivalent)}</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>Trees equivalent planted</div>
          </div>
        </div>

        {/* ── Breakdown Bar Chart (Data dari /breakdown) ── */}
        {breakdownList.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "24px", padding: "3rem", border: "1px solid rgba(0, 53, 102, 0.06)", boxShadow: "0 12px 40px rgba(0,29,61,0.06)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--prussian)", marginBottom: "2.5rem", textTransform: "uppercase" }}>
              CO₂ Saved Breakdown by Category
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
              {breakdownList.map((item, index) => (
                <div key={item.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--prussian)" }}>{item.category}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#64748b" }}>
                      <span style={{ color: "var(--prussian)" }}>{item.co2_kg.toFixed(1)}</span> kg ({item.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "14px", background: "rgba(0,53,102,0.04)", borderRadius: "8px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: "100%", background: CATEGORY_COLORS[index % CATEGORY_COLORS.length], borderRadius: "8px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}